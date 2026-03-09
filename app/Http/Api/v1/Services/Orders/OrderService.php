<?php

namespace App\Http\Api\v1\Services\Orders;

use App\Http\Api\v1\Services\GcsService;
use App\Http\Api\v1\Services\Payments\NiubizService;
use App\Models\Orders\Order;
use App\Models\Products\ProductVariant;
use App\Models\Customers\Customer;
use App\Models\Settings\DeliverySetting;
use App\Models\Settings\DeliveryZone;
use App\Models\Settings\PaymentMethod;
use App\Models\Ubigeos\Department;
use App\Models\Ubigeos\District;
use App\Models\Ubigeos\Province;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderService
{
    public function __construct(
        protected GcsService $gcsService,
        protected NiubizService $niubizService
    ) {}

    public function preview(array $payload): array
    {
        $items = $this->normalizeItems($payload['items']);
        $variants = $this->resolveVariants($items);
        $subtotal = $this->calculateSubtotal($items, $variants);
        $shippingInput = $this->extractShippingInput($payload);

        $shipping = $this->resolveShippingQuote(
            $shippingInput['department_id'],
            $shippingInput['province_id'],
            $shippingInput['district_id'],
            $subtotal
        );

        return [
            'subtotal' => round($subtotal, 2),
            'delivery_cost' => round($shipping['delivery_cost'], 2),
            'discount_total' => 0,
            'total' => round($subtotal + $shipping['delivery_cost'], 2),
            'shipping' => $shipping,
            'items' => $this->previewItemsPayload($items, $variants),
        ];
    }

    public function create(Customer $customer, array $payload): Order
    {
        return DB::transaction(function () use ($customer, $payload) {
            $items = $this->normalizeItems($payload['items']);
            $variants = $this->resolveVariants($items, true);
            $subtotal = $this->calculateSubtotal($items, $variants);

            $shippingInput = $payload['shipping_info'];
            $shipping = $this->resolveShippingQuote(
                $shippingInput['department_id'],
                $shippingInput['province_id'],
                $shippingInput['district_id'],
                $subtotal
            );

            $paymentInfo = $payload['payment_info'];
            $selectedPaymentMethod = $this->resolvePaymentMethod($paymentInfo);
            // Niubiz debe confirmarse por validacion server-to-server, no por payload del cliente.
            $isNiubizApproved = false;

            $customerInfo = $payload['customer_info'];
            $billingInfo = $payload['billing_info'] ?? [];

            $order = Order::create([
                'code' => $this->generateOrderCode(),
                'customer_id' => $customer->id,

                'customer_email' => strtolower(trim($customerInfo['email'])),
                'customer_first_name' => trim($customerInfo['first_name']),
                'customer_last_name' => trim($customerInfo['last_name']),
                'customer_document_type' => $customerInfo['document_type'],
                'customer_document_number' => trim($customerInfo['document_number']),
                'customer_mobile_phone' => trim($customerInfo['mobile_phone']),

                'voucher_type' => $payload['voucher_type'],
                'billing_ruc' => data_get($billingInfo, 'ruc'),
                'billing_social_reason' => data_get($billingInfo, 'social_reason'),
                'billing_fiscal_address' => data_get($billingInfo, 'fiscal_address'),

                'department_id' => $shippingInput['department_id'],
                'province_id' => $shippingInput['province_id'],
                'district_id' => $shippingInput['district_id'],
                'department_name' => $shipping['department_name'],
                'province_name' => $shipping['province_name'],
                'district_name' => $shipping['district_name'],
                'shipping_address_line' => $shippingInput['address_line'],
                'shipping_number' => data_get($shippingInput, 'number'),
                'shipping_floor_apartment' => data_get($shippingInput, 'floor_apartment'),
                'shipping_reference' => data_get($shippingInput, 'reference'),

                'currency' => 'PEN',
                'subtotal' => $subtotal,
                'delivery_cost' => $shipping['delivery_cost'],
                'discount_total' => 0,
                'total' => $subtotal + $shipping['delivery_cost'],

                'payment_method_id' => $selectedPaymentMethod?->id,
                'payment_method_type' => $paymentInfo['method'],
                'status' => 'pending',
                'payment_status' => $isNiubizApproved ? 'approved' : 'pending',
                'shipping_status' => 'pending',
                'placed_at' => now(),
                'paid_at' => $isNiubizApproved ? now() : null,
                'notes' => data_get($payload, 'notes'),
            ]);

            foreach ($items as $item) {
                /** @var ProductVariant $variant */
                $variant = $variants[$item['variant_id']];
                $unitPrice = (float) $variant->active_price;
                $quantity = (int) $item['quantity'];

                if ($variant->stock < $quantity) {
                    throw new \InvalidArgumentException("Stock insuficiente para SKU {$variant->sku}.");
                }

                $order->items()->create([
                    'product_id' => $variant->product_id,
                    'variant_id' => $variant->id,
                    'item_type' => 'product_variant',
                    'product_name' => $variant->product?->name ?? 'Producto',
                    'variant_sku' => $variant->sku,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'line_total' => $unitPrice * $quantity,
                    'metadata' => [
                        'is_on_promo' => (bool) $variant->is_on_promo,
                        'promo_price' => $variant->promo_price,
                    ],
                ]);

                $variant->decrement('stock', $quantity);
            }

            $payment = $order->payments()->create([
                'payment_method_id' => $selectedPaymentMethod?->id,
                'method' => $paymentInfo['method'],
                'status' => $isNiubizApproved ? 'approved' : 'pending',
                'amount' => $order->total,
                'gateway_transaction_id' => data_get($paymentInfo, 'niubiz.transaction_id'),
                'gateway_authorization_code' => data_get($paymentInfo, 'niubiz.authorization_code'),
                'gateway_brand' => data_get($paymentInfo, 'niubiz.brand'),
                'gateway_masked_card' => data_get($paymentInfo, 'niubiz.masked_card'),
                'gateway_payload' => data_get($paymentInfo, 'niubiz.payload'),
                'paid_at' => $isNiubizApproved ? now() : null,
            ]);

            if ($paymentInfo['method'] === 'bank_transfer' && Arr::has($paymentInfo, 'voucher_file')) {
                $url = $this->uploadVoucherFile($paymentInfo['voucher_file'], $order->id);
                $payment->update([
                    'voucher_url' => $url,
                    'voucher_uploaded_at' => now(),
                ]);
            }

            $this->registerStatusHistory($order, null, 'pending', 'customer', $customer->id, 'Orden creada');

            $customerUpdates = [
                'full_name' => trim($customerInfo['first_name'] . ' ' . $customerInfo['last_name']),
                'email' => strtolower(trim($customerInfo['email'])),
                'phone' => trim($customerInfo['mobile_phone']),
            ];

            if ($customerInfo['document_type'] === 'dni') {
                $customerUpdates['dni'] = trim($customerInfo['document_number']);
            }

            $customer->update($customerUpdates);

            return $order->load([
                'items',
                'payments',
                'statusHistory',
                'paymentMethod:id,name,company_type',
            ]);
        });
    }

    public function listForCustomer(string $customerId, int $perPage = 10): LengthAwarePaginator
    {
        return Order::query()
            ->ownedByCustomer($customerId)
            ->with(['items', 'payments'])
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function showForCustomer(Order $order, string $customerId): Order
    {
        $this->ensureOwnership($order, $customerId);

        return $order->load([
            'items',
            'payments',
            'statusHistory',
            'paymentMethod:id,name,company_type',
        ]);
    }

    public function cancelByCustomer(Order $order, string $customerId, ?string $reason = null): Order
    {
        return DB::transaction(function () use ($order, $customerId, $reason) {
            $order = Order::query()->with('items')->lockForUpdate()->findOrFail($order->id);
            $this->ensureOwnership($order, $customerId);

            if (!$order->canBeCancelledByCustomer()) {
                throw new \InvalidArgumentException('La orden no puede ser cancelada en su estado actual.');
            }

            $previousStatus = $order->status;

            $order->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
                'notes' => $reason ? trim(($order->notes ? $order->notes . "\n" : '') . 'Cancelada por cliente: ' . $reason) : $order->notes,
            ]);

            $this->restoreStockForOrder($order);
            $this->registerStatusHistory($order, $previousStatus, 'cancelled', 'customer', $customerId, $reason ?: 'Cancelada por cliente');

            return $order->fresh(['items', 'payments', 'statusHistory']);
        });
    }

    public function uploadVoucher(Order $order, string $customerId, UploadedFile $voucherFile): Order
    {
        $this->ensureOwnership($order, $customerId);

        if ($order->payment_method_type !== 'bank_transfer') {
            throw new \InvalidArgumentException('Solo las órdenes por transferencia aceptan voucher.');
        }

        $payment = $order->payments()->latest()->first();

        if (!$payment) {
            throw new \InvalidArgumentException('No existe un registro de pago para esta orden.');
        }

        $url = $this->uploadVoucherFile($voucherFile, $order->id);

        $payment->update([
            'voucher_url' => $url,
            'voucher_uploaded_at' => now(),
            'status' => 'pending',
        ]);

        return $order->fresh(['payments', 'items', 'statusHistory']);
    }

    public function confirmNiubizPayment(Order $order, string $customerId, string $purchaseNumber): Order
    {
        $this->ensureOwnership($order, $customerId);

        if ($order->payment_method_type !== 'niubiz') {
            throw new \InvalidArgumentException('La orden no usa método de pago Niubiz.');
        }

        $confirmation = $this->niubizService->confirmAuthorization($purchaseNumber);

        return DB::transaction(function () use ($order, $customerId, $confirmation) {
            $order = Order::query()->with(['payments'])->lockForUpdate()->findOrFail($order->id);
            $this->ensureOwnership($order, $customerId);

            $payment = $order->payments()->latest()->first();

            if (!$payment) {
                throw new \InvalidArgumentException('No existe un registro de pago para esta orden.');
            }

            if ($confirmation['is_approved']) {
                $alreadyApproved = $order->payment_status === 'approved';

                $orderPayload = [
                    'payment_status' => 'approved',
                    'paid_at' => $order->paid_at ?? now(),
                ];

                if ($order->status === 'pending') {
                    $orderPayload['status'] = 'confirmed';
                    $orderPayload['confirmed_at'] = $order->confirmed_at ?? now();
                }

                $order->update($orderPayload);

                $payment->update([
                    'status' => 'approved',
                    'paid_at' => $payment->paid_at ?? now(),
                    'gateway_transaction_id' => $confirmation['transaction_id'],
                    'gateway_authorization_code' => $confirmation['authorization_code'],
                    'gateway_brand' => $confirmation['brand'],
                    'gateway_masked_card' => $confirmation['masked_card'],
                    'gateway_payload' => $confirmation['raw'],
                ]);

                if (!$alreadyApproved) {
                    $this->registerStatusHistory(
                        $order,
                        null,
                        'payment:approved',
                        'customer',
                        $customerId,
                        'Pago confirmado por Niubiz'
                    );
                }
            } else {
                $order->update(['payment_status' => 'rejected']);

                $payment->update([
                    'status' => 'rejected',
                    'rejected_at' => now(),
                    'gateway_transaction_id' => $confirmation['transaction_id'],
                    'gateway_authorization_code' => $confirmation['authorization_code'],
                    'gateway_brand' => $confirmation['brand'],
                    'gateway_masked_card' => $confirmation['masked_card'],
                    'gateway_payload' => $confirmation['raw'],
                ]);

                $this->registerStatusHistory(
                    $order,
                    null,
                    'payment:rejected',
                    'customer',
                    $customerId,
                    $confirmation['response_message'] ?: 'Pago rechazado por Niubiz'
                );
            }

            return $order->fresh(['items', 'payments', 'statusHistory', 'paymentMethod:id,name,company_type']);
        });
    }

    public function updateOrderStatusByAdmin(Order $order, string $newStatus, ?string $note = null, ?string $adminId = null): Order
    {
        return DB::transaction(function () use ($order, $newStatus, $note, $adminId) {
            $order = Order::query()->with('items')->lockForUpdate()->findOrFail($order->id);

            $previousStatus = $order->status;
            $this->assertOrderStatusTransition($previousStatus, $newStatus);

            if ($previousStatus === $newStatus) {
                return $order->fresh(['items', 'payments', 'statusHistory']);
            }

            $payload = ['status' => $newStatus];

            if ($newStatus === 'confirmed') {
                $payload['confirmed_at'] = now();
            }
            if ($newStatus === 'shipped') {
                $payload['shipped_at'] = now();
                $payload['shipping_status'] = 'in_transit';
            }
            if ($newStatus === 'delivered') {
                $payload['delivered_at'] = now();
                $payload['shipping_status'] = 'delivered';
            }
            if ($newStatus === 'cancelled') {
                $payload['cancelled_at'] = now();
            }
            if ($previousStatus === 'cancelled' && $newStatus === 'pending') {
                $payload['cancelled_at'] = null;
                $payload['shipping_status'] = 'pending';
                $payload['shipped_at'] = null;
                $payload['delivered_at'] = null;
            }

            $order->update($payload);

            if ($newStatus === 'cancelled') {
                $this->restoreStockForOrder($order);
            }
            if ($previousStatus === 'cancelled' && $newStatus === 'pending') {
                $this->reserveStockForOrder($order);
            }

            $this->registerStatusHistory($order, $previousStatus, $newStatus, 'admin', $adminId, $note);

            return $order->fresh(['items', 'payments', 'statusHistory']);
        });
    }

    public function updatePaymentStatusByAdmin(Order $order, string $newStatus, ?string $note = null, ?string $adminId = null): Order
    {
        $this->assertPaymentStatusTransition($order->payment_status, $newStatus);

        $order->update([
            'payment_status' => $newStatus,
            'paid_at' => $newStatus === 'approved' ? now() : $order->paid_at,
        ]);

        $payment = $order->payments()->latest()->first();
        if ($payment) {
            $payment->update([
                'status' => $newStatus,
                'paid_at' => $newStatus === 'approved' ? now() : $payment->paid_at,
                'rejected_at' => in_array($newStatus, ['rejected', 'failed'], true) ? now() : $payment->rejected_at,
            ]);
        }

        $this->registerStatusHistory(
            $order,
            null,
            'payment:' . $newStatus,
            'admin',
            $adminId,
            $note
        );

        return $order->fresh(['items', 'payments', 'statusHistory']);
    }

    public function updateShippingStatusByAdmin(Order $order, string $newStatus, ?string $note = null, ?string $adminId = null): Order
    {
        $this->assertShippingStatusTransition($order->shipping_status, $newStatus);

        $order->update([
            'shipping_status' => $newStatus,
            'shipped_at' => $newStatus === 'in_transit' ? now() : $order->shipped_at,
            'delivered_at' => $newStatus === 'delivered' ? now() : $order->delivered_at,
        ]);

        if ($newStatus === 'delivered' && $order->status !== 'delivered') {
            $previousStatus = $order->status;
            $order->update(['status' => 'delivered']);
            $this->registerStatusHistory($order, $previousStatus, 'delivered', 'admin', $adminId, 'Marcada como entregada desde shipping');
        }

        $this->registerStatusHistory(
            $order,
            null,
            'shipping:' . $newStatus,
            'admin',
            $adminId,
            $note
        );

        return $order->fresh(['items', 'payments', 'statusHistory']);
    }

    private function resolveShippingQuote(string $departmentId, string $provinceId, string $districtId, float $subtotal): array
    {
        $department = Department::query()->findOrFail($departmentId);
        $province = Province::query()->findOrFail($provinceId);
        $district = District::query()->findOrFail($districtId);

        if ($province->department_id !== $department->id) {
            throw new \InvalidArgumentException('La provincia no pertenece al departamento enviado.');
        }

        if ($district->province_id !== $province->id) {
            throw new \InvalidArgumentException('El distrito no pertenece a la provincia enviada.');
        }

        $zone = DeliveryZone::query()
            ->where(function ($query) use ($departmentId, $provinceId, $districtId) {
                $query->where(fn($q) => $q->where('zone_type', 'district')->where('zone_id', $districtId))
                    ->orWhere(fn($q) => $q->where('zone_type', 'province')->where('zone_id', $provinceId))
                    ->orWhere(fn($q) => $q->where('zone_type', 'department')->where('zone_id', $departmentId));
            })
            ->orderByRaw("CASE zone_type WHEN 'district' THEN 1 WHEN 'province' THEN 2 ELSE 3 END")
            ->first();

        if (!$zone) {
            throw new \InvalidArgumentException('No hay cobertura de delivery para la zona seleccionada.');
        }

        $settings = DeliverySetting::query()->first();
        $minimumOrder = (float) ($settings?->order_amount_threshold ?? 0);
        $freeDeliveryThreshold = (float) ($settings?->minimum_order_amount ?? 0);

        if ($subtotal < $minimumOrder) {
            throw new \InvalidArgumentException("El monto mínimo para comprar es S/ {$minimumOrder}.");
        }

        $deliveryCost = $subtotal >= $freeDeliveryThreshold ? 0 : (float) $zone->delivery_cost;

        return [
            'zone_type' => $zone->zone_type,
            'zone_id' => $zone->zone_id,
            'delivery_cost' => round($deliveryCost, 2),
            'minimum_order_threshold' => $minimumOrder,
            'free_delivery_threshold' => $freeDeliveryThreshold,
            'amount_to_free_delivery' => max(0, round($freeDeliveryThreshold - $subtotal, 2)),
            'department_name' => $department->name,
            'province_name' => $province->name,
            'district_name' => $district->name,
        ];
    }

    private function resolveVariants(array $items, bool $lockForUpdate = false): array
    {
        $ids = collect($items)->pluck('variant_id')->unique()->values();

        $query = ProductVariant::query()
            ->whereIn('id', $ids)
            ->where('is_active', true)
            ->with('product:id,name');

        if ($lockForUpdate) {
            $query->lockForUpdate();
        }

        $variants = $query->get()->keyBy('id');

        if ($variants->count() !== $ids->count()) {
            throw new \InvalidArgumentException('Uno o más productos no son válidos o no están activos.');
        }

        return $variants->all();
    }

    private function calculateSubtotal(array $items, array $variants): float
    {
        $subtotal = 0;

        foreach ($items as $item) {
            /** @var ProductVariant $variant */
            $variant = $variants[$item['variant_id']];
            $quantity = (int) $item['quantity'];

            if ($variant->stock < $quantity) {
                throw new \InvalidArgumentException("Stock insuficiente para SKU {$variant->sku}.");
            }

            $subtotal += (float) $variant->active_price * $quantity;
        }

        return $subtotal;
    }

    private function previewItemsPayload(array $items, array $variants): array
    {
        return collect($items)->map(function ($item) use ($variants) {
            /** @var ProductVariant $variant */
            $variant = $variants[$item['variant_id']];

            return [
                'variant_id' => $variant->id,
                'sku' => $variant->sku,
                'product_name' => $variant->product?->name,
                'quantity' => (int) $item['quantity'],
                'unit_price' => (float) $variant->active_price,
                'line_total' => (float) $variant->active_price * (int) $item['quantity'],
                'stock_available' => (int) $variant->stock,
            ];
        })->values()->all();
    }

    private function normalizeItems(array $items): array
    {
        return collect($items)
            ->groupBy('variant_id')
            ->map(fn($group, $variantId) => [
                'variant_id' => (string) $variantId,
                'quantity' => $group->sum(fn($item) => (int) ($item['quantity'] ?? 0)),
            ])
            ->filter(fn($item) => $item['quantity'] > 0)
            ->values()
            ->all();
    }

    private function extractShippingInput(array $payload): array
    {
        return $payload['shipping_info'] ?? [
            'department_id' => $payload['department_id'],
            'province_id' => $payload['province_id'],
            'district_id' => $payload['district_id'],
        ];
    }

    private function uploadVoucherFile(UploadedFile $file, string $orderId): string
    {
        $directory = "orders/{$orderId}/payments";
        return $this->gcsService->uploadFile($file, $directory);
    }

    private function ensureOwnership(Order $order, string $customerId): void
    {
        if ($order->customer_id !== $customerId) {
            throw new \InvalidArgumentException('No tienes permisos para acceder a esta orden.');
        }
    }

    private function resolvePaymentMethod(array $paymentInfo): ?PaymentMethod
    {
        $method = $paymentInfo['method'];
        $paymentMethodId = data_get($paymentInfo, 'payment_method_id');

        if ($method === 'niubiz') {
            if ($paymentMethodId) {
                throw new \InvalidArgumentException('Niubiz no debe enviar payment_method_id.');
            }

            return null;
        }

        if (!$paymentMethodId) {
            throw new \InvalidArgumentException('Debe seleccionar una cuenta bancaria activa para transferencia.');
        }

        $paymentMethod = PaymentMethod::query()
            ->where('id', $paymentMethodId)
            ->where('is_active', true)
            ->first();

        if (!$paymentMethod) {
            throw new \InvalidArgumentException('La cuenta bancaria seleccionada no existe o está inactiva.');
        }

        return $paymentMethod;
    }

    private function restoreStockForOrder(Order $order): void
    {
        foreach ($order->items as $item) {
            if (!$item->variant_id) {
                continue;
            }

            $variant = ProductVariant::query()
                ->where('id', $item->variant_id)
                ->lockForUpdate()
                ->first();

            if (!$variant) {
                continue;
            }

            $variant->increment('stock', (int) $item->quantity);
        }
    }

    private function reserveStockForOrder(Order $order): void
    {
        foreach ($order->items as $item) {
            if (!$item->variant_id) {
                continue;
            }

            $variant = ProductVariant::query()
                ->where('id', $item->variant_id)
                ->lockForUpdate()
                ->first();

            if (!$variant) {
                throw new \InvalidArgumentException("No existe la variante {$item->variant_id} para reactivar la orden.");
            }

            $quantity = (int) $item->quantity;
            if ($variant->stock < $quantity) {
                throw new \InvalidArgumentException("No hay stock suficiente para reactivar la orden en SKU {$variant->sku}.");
            }

            $variant->decrement('stock', $quantity);
        }
    }

    private function assertOrderStatusTransition(string $from, string $to): void
    {
        if ($from === $to) {
            return;
        }

        $map = [
            'pending' => ['confirmed', 'cancelled'],
            'confirmed' => ['preparing', 'cancelled'],
            'preparing' => ['shipped', 'cancelled'],
            'shipped' => ['delivered'],
            'delivered' => [],
            'cancelled' => ['pending'],
        ];

        if (!in_array($to, $map[$from] ?? [], true)) {
            throw new \InvalidArgumentException("Transición de estado no permitida: {$from} -> {$to}.");
        }
    }

    private function assertPaymentStatusTransition(string $from, string $to): void
    {
        if ($from === $to) {
            return;
        }

        $map = [
            'pending' => ['approved', 'rejected', 'failed'],
            'approved' => ['refunded'],
            'rejected' => ['pending'],
            'failed' => ['pending'],
            'refunded' => [],
        ];

        if (!in_array($to, $map[$from] ?? [], true)) {
            throw new \InvalidArgumentException("Transición de pago no permitida: {$from} -> {$to}.");
        }
    }

    private function assertShippingStatusTransition(string $from, string $to): void
    {
        if ($from === $to) {
            return;
        }

        $map = [
            'pending' => ['assigned', 'in_transit', 'failed'],
            'assigned' => ['in_transit', 'failed'],
            'in_transit' => ['delivered', 'failed'],
            'delivered' => [],
            'failed' => ['assigned', 'in_transit'],
        ];

        if (!in_array($to, $map[$from] ?? [], true)) {
            throw new \InvalidArgumentException("Transición de envío no permitida: {$from} -> {$to}.");
        }
    }

    private function registerStatusHistory(
        Order $order,
        ?string $fromStatus,
        string $toStatus,
        string $changedByType,
        ?string $changedById,
        ?string $note = null
    ): void {
        $order->statusHistory()->create([
            'from_status' => $fromStatus,
            'to_status' => $toStatus,
            'changed_by_type' => $changedByType,
            'changed_by_id' => $changedById,
            'note' => $note,
        ]);
    }

    private function generateOrderCode(): string
    {
        $date = now()->format('Ymd');

        for ($i = 0; $i < 5; $i++) {
            $code = 'ORD-' . $date . '-' . strtoupper(Str::random(4));

            if (!Order::query()->where('code', $code)->exists()) {
                return $code;
            }
        }

        throw new \RuntimeException('No se pudo generar un código único de orden.');
    }
}
