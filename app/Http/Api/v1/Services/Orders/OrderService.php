<?php

namespace App\Http\Api\v1\Services\Orders;

use App\Http\Api\v1\Services\Coupons\CouponService;
use App\Http\Api\v1\Services\GcsService;
use App\Models\Coupons\CouponRedemption;
use App\Models\Orders\Order;
use App\Models\Products\ProductPack;
use App\Models\Products\ProductVariant;
use App\Models\Customers\Customer;
use App\Models\Settings\DeliverySetting;
use App\Models\Settings\DeliveryZone;
use App\Models\Ubigeos\Department;
use App\Models\Ubigeos\District;
use App\Models\Ubigeos\Province;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class OrderService
{
    public function __construct(
        protected GcsService $gcsService,
        protected OrderNotificationService $orderNotificationService,
        protected CouponService $couponService
    ) {}

    public function validateOrder(array $payload): array
    {
        $items = $this->normalizeItems($payload['items']);
        $variants = $this->resolveVariants($items);
        $packs = $this->resolvePacks($items);
        $subtotal = $this->calculateSubtotal($items, $variants, $packs);
        $couponCode = trim((string) ($payload['coupon_code'] ?? ''));
        $discountTotal = 0.0;
        $couponData = null;

        if ($couponCode !== '') {
            $couponData = $this->couponService->validateForOrder(
                $couponCode,
                collect($variants),
                $items,
                (string) auth('api')->id(),
                false,
                collect($packs)
            );
            $discountTotal = (float) $couponData['discount_total'];
        }

        $netSubtotal = max(0, $subtotal - $discountTotal);
        $thresholds = $this->resolveOrderThresholds($netSubtotal);
        $shipping = null;
        $deliveryCost = 0.0;
        $shippingInput = $this->extractShippingInput($payload);

        if ($shippingInput) {
            $shipping = $this->resolveShippingQuote(
                $shippingInput['department_id'],
                $shippingInput['province_id'],
                $shippingInput['district_id'],
                $netSubtotal,
                false
            );
            $deliveryCost = (float) $shipping['delivery_cost'];
        }

        return [
            'currency' => 'PEN',
            'minimum_purchase_amount' => $thresholds['minimum_purchase_amount'],
            'amount_missing_for_minimum_purchase' => $thresholds['amount_missing_for_minimum_purchase'],
            'free_delivery_threshold' => $thresholds['free_delivery_threshold'],
            'amount_to_free_delivery' => $thresholds['amount_to_free_delivery'],
            'subtotal' => round($subtotal, 2),
            'delivery_cost' => round($deliveryCost, 2),
            'discount_total' => round($discountTotal, 2),
            'total' => round(($subtotal - $discountTotal) + $deliveryCost, 2),
            'shipping' => $shipping,
            'coupon' => $couponData ? Arr::except($couponData, ['coupon']) : null,
            'items' => $this->previewItemsPayload($items, $variants, $packs),
        ];
    }

    public function create(Customer $customer, array $payload): Order
    {
        return DB::transaction(function () use ($customer, $payload) {
            $items = $this->normalizeItems($payload['items']);
            $variants = $this->resolveVariants($items, true);
            $packs = $this->resolvePacks($items, true);
            $subtotal = $this->calculateSubtotal($items, $variants, $packs);
            $couponCode = trim((string) ($payload['coupon_code'] ?? ''));
            $couponData = null;
            $discountTotal = 0.0;

            if ($couponCode !== '') {
                $couponData = $this->couponService->validateForOrder(
                    $couponCode,
                    collect($variants),
                    $items,
                    $customer->id,
                    true,
                    collect($packs)
                );
                $discountTotal = (float) $couponData['discount_total'];
            }

            $shippingInput = $payload['shipping_info'];
            $netSubtotal = max(0, $subtotal - $discountTotal);
            $shipping = $this->resolveShippingQuote(
                $shippingInput['department_id'],
                $shippingInput['province_id'],
                $shippingInput['district_id'],
                $netSubtotal
            );

            $paymentInfo = $payload['payment_info'];
            // Niubiz debe confirmarse por validacion server-to-server, no por payload del cliente.
            $isNiubizApproved = false;
            $orderCode = $this->generateOrderCode();

            $customerInfo = $payload['customer_info'];
            $billingInfo = $payload['billing_info'] ?? [];

            $order = Order::create([
                'code' => $orderCode,
                'niubiz_purchase_number' => $paymentInfo['method'] === 'niubiz'
                    ? preg_replace('/\D/', '', $orderCode)
                    : null,
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
                'discount_total' => $discountTotal,
                'total' => ($subtotal - $discountTotal) + $shipping['delivery_cost'],

                'payment_method_id' => null,
                'payment_method_type' => $paymentInfo['method'],
                'state' => $isNiubizApproved ? 'payment_received' : 'pending_payment',
                'placed_at' => now(),
                'paid_at' => $isNiubizApproved ? now() : null,
                'notes' => data_get($payload, 'notes'),
            ]);

            foreach ($items as $item) {
                $quantity = (int) $item['quantity'];
                if ($item['item_type'] === 'product_pack') {
                    /** @var ProductPack $pack */
                    $pack = $packs[$item['pack_id']];
                    $unitPrice = (float) $pack->active_price;
                    $isPromoActive = (bool) $pack->is_on_promotion
                        && (!$pack->promo_start_at || $pack->promo_start_at->isPast())
                        && (!$pack->promo_end_at || $pack->promo_end_at->isFuture());

                    if ($pack->stock < $quantity) {
                        throw new \InvalidArgumentException("Stock insuficiente para el pack {$pack->name}.");
                    }

                    $order->items()->create([
                        'product_id' => null,
                        'variant_id' => null,
                        'pack_id' => $pack->id,
                        'item_type' => 'product_pack',
                        'product_name' => $pack->name,
                        'variant_sku' => $pack->code ? "PACK-{$pack->code}" : "PACK-{$pack->id}",
                        'quantity' => $quantity,
                        'unit_price' => $unitPrice,
                        'line_total' => $unitPrice * $quantity,
                        'metadata' => [
                            'is_on_promo' => $isPromoActive,
                            'regular_price' => (float) $pack->price,
                            'pack_image' => $pack->mainImage?->file_path,
                            'pack_description' => $pack->brief_description,
                        ],
                    ]);

                    $pack->decrement('stock', $quantity);
                    continue;
                }

                /** @var ProductVariant $variant */
                $variant = $variants[$item['variant_id']];
                $unitPrice = (float) $variant->active_price;
                $isPromoActive = (bool) $variant->is_on_promo
                    && (!$variant->promo_start_at || $variant->promo_start_at->isPast())
                    && (!$variant->promo_end_at || $variant->promo_end_at->isFuture());

                if ($variant->stock < $quantity) {
                    throw new \InvalidArgumentException("Stock insuficiente para SKU {$variant->sku}.");
                }

                $order->items()->create([
                    'product_id' => $variant->product_id,
                    'variant_id' => $variant->id,
                    'pack_id' => null,
                    'item_type' => 'product_variant',
                    'product_name' => $variant->product?->name ?? 'Producto',
                    'variant_sku' => $variant->sku,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'line_total' => $unitPrice * $quantity,
                    'metadata' => [
                        // Snapshot comercial para auditoria del item al momento de compra.
                        'is_on_promo' => $isPromoActive,
                        'regular_price' => (float) $variant->price,
                        'variant_image' => $variant->mainImage?->file_path,
                        'variant_attributes' => $variant->attributes
                            ->map(function ($attributeValue) {
                                $attributeName = trim((string) data_get($attributeValue, 'attribute.name'));
                                $value = trim((string) data_get($attributeValue, 'value'));

                                if ($attributeName === '' && $value === '') {
                                    return null;
                                }

                                return $attributeName !== '' ? "{$attributeName}: {$value}" : $value;
                            })
                            ->filter()
                            ->values()
                            ->all(),
                    ],
                ]);

                $variant->decrement('stock', $quantity);
            }

            if ($couponData) {
                CouponRedemption::create([
                    'coupon_id' => $couponData['coupon_id'],
                    'customer_id' => $customer->id,
                    'order_id' => $order->id,
                    'discount_applied' => $discountTotal,
                    'redeemed_at' => now(),
                ]);
            }

            $payment = $order->payments()->create([
                'payment_method_id' => null,
                'method' => $paymentInfo['method'],
                'status' => $isNiubizApproved ? 'approved' : 'pending',
                'amount' => $order->total,
                'gateway_transaction_id' => null,
                'gateway_authorization_code' => null,
                'gateway_brand' => null,
                'gateway_masked_card' => null,
                'gateway_payload' => null,
                'paid_at' => $isNiubizApproved ? now() : null,
            ]);

            if ($paymentInfo['method'] === 'bank_transfer' && Arr::has($paymentInfo, 'voucher_file')) {
                $url = $this->uploadVoucherFile($paymentInfo['voucher_file'], $order->id);
                $payment->update([
                    'voucher_url' => $url,
                    'voucher_uploaded_at' => now(),
                ]);
            }

            $this->registerStatusHistory($order, null, $order->state, 'customer', $customer->id, 'Orden creada');

            $order = $order->load([
                'items',
                'payments',
                'statusHistory',
            ]);

            $this->orderNotificationService->sendOrderCreated($order);

            return $order;
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

            $previousStatus = $order->state;

            $order->update([
                'state' => 'cancelled',
                'cancelled_at' => now(),
                'notes' => $reason ? trim(($order->notes ? $order->notes . "\n" : '') . 'Cancelada por cliente: ' . $reason) : $order->notes,
            ]);

            $this->restoreStockForOrder($order);
            $this->registerStatusHistory($order, $previousStatus, 'cancelled', 'customer', $customerId, $reason ?: 'Cancelada por cliente');

            $this->orderNotificationService->sendStateChanged($order, $previousStatus, 'cancelled');

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
            'paid_at' => null,
            'rejected_at' => null,
        ]);

        $order->update([
            'state' => 'pending_payment',
            'paid_at' => null,
        ]);

        return $order->fresh(['payments', 'items', 'statusHistory']);
    }

    public function updateStateByAdmin(Order $order, string $newState, ?string $note = null, ?string $adminId = null): Order
    {
        return DB::transaction(function () use ($order, $newState, $note, $adminId) {
            $order = Order::query()->with('items')->lockForUpdate()->findOrFail($order->id);

            $previousState = $order->state;

            // Regla de negocio: si Niubiz ya confirmó pago, no se permite volver a pendiente.
            if (
                $newState === 'pending_payment'
                && $order->payment_method_type === 'niubiz'
                && in_array($previousState, ['payment_received', 'preparing', 'in_delivery', 'delivered', 'refunded'], true)
            ) {
                throw new \InvalidArgumentException(
                    'No se puede volver a pendiente en una orden Niubiz con pago confirmado. Usa reembolso/correccion operativa.'
                );
            }

            if (
                $newState === 'payment_failed'
                && $order->payment_method_type === 'niubiz'
                && in_array($previousState, ['payment_received', 'preparing', 'in_delivery', 'delivered', 'refunded'], true)
            ) {
                throw new \InvalidArgumentException(
                    'El pago Niubiz ya fue aprobado y no puede marcarse como rechazado/fallido.'
                );
            }

            $this->assertStateTransition($previousState, $newState);

            if ($previousState === $newState) {
                return $order->fresh(['items', 'payments', 'statusHistory']);
            }

            $payload = ['state' => $newState];

            if ($newState === 'payment_received') {
                $payload['confirmed_at'] = now();
            }
            if ($newState === 'in_delivery') {
                $payload['shipped_at'] = now();
            }
            if ($newState === 'delivered') {
                $payload['delivered_at'] = now();
            }
            if ($newState === 'cancelled') {
                $payload['cancelled_at'] = now();
            }
            if ($previousState === 'cancelled' && $newState !== 'cancelled') {
                $payload['cancelled_at'] = null;
                $payload['shipped_at'] = null;
                $payload['delivered_at'] = null;
            }

            $order->update($payload);

            $payment = $order->payments()->latest()->first();
            if ($payment) {
                if ($newState === 'payment_received') {
                    $payment->update([
                        'status' => 'approved',
                        'paid_at' => $payment->paid_at ?? now(),
                        'rejected_at' => null,
                    ]);
                } elseif ($newState === 'payment_failed') {
                    $payment->update([
                        'status' => 'failed',
                        'rejected_at' => now(),
                    ]);
                } elseif ($newState === 'refunded') {
                    $payment->update([
                        'status' => 'refunded',
                    ]);
                } elseif ($newState === 'pending_payment') {
                    $payment->update([
                        'status' => 'pending',
                        'paid_at' => null,
                        'rejected_at' => null,
                    ]);
                }
            }

            if ($newState === 'cancelled') {
                $this->restoreStockForOrder($order);
            }
            if ($previousState === 'cancelled' && $newState !== 'cancelled') {
                $this->reserveStockForOrder($order);
            }

            $this->registerStatusHistory($order, $previousState, $newState, 'admin', $adminId, $note);
            $this->orderNotificationService->sendStateChanged($order, $previousState, $newState);

            return $order->fresh(['items', 'payments', 'statusHistory']);
        });
    }

    // Legacy wrappers kept for compatibility while frontend migrates.
    public function updateOrderStatusByAdmin(Order $order, string $newStatus, ?string $note = null, ?string $adminId = null): Order
    {
        return $this->updateStateByAdmin($order, $this->mapLegacyOrderStatusToState($newStatus), $note, $adminId);
    }

    public function updatePaymentStatusByAdmin(Order $order, string $newStatus, ?string $note = null, ?string $adminId = null): Order
    {
        return $this->updateStateByAdmin($order, $this->mapLegacyPaymentStatusToState($newStatus), $note, $adminId);
    }

    public function updateShippingStatusByAdmin(Order $order, string $newStatus, ?string $note = null, ?string $adminId = null): Order
    {
        return $this->updateStateByAdmin($order, $this->mapLegacyShippingStatusToState($newStatus), $note, $adminId);
    }

    public function applyAdminAction(Order $order, string $action, ?string $note = null, ?string $adminId = null): Order
    {
        return match ($action) {
            'accept_payment' => $this->updateStateByAdmin($order, 'payment_received', $note, $adminId),
            'reject_payment' => $this->updateStateByAdmin($order, 'payment_failed', $note, $adminId),
            'reset_to_pending_payment' => $this->updateStateByAdmin($order, 'pending_payment', $note, $adminId),
            'start_preparing' => $this->updateStateByAdmin($order, 'preparing', $note, $adminId),
            'schedule_shipping' => $this->updateStateByAdmin($order, 'in_delivery', $note, $adminId),
            'start_transit' => $this->updateStateByAdmin($order, 'in_delivery', $note, $adminId),
            'mark_delivered_full' => $this->updateStateByAdmin($order, 'delivered', $note, $adminId),
            'mark_delivery_failed' => $this->updateStateByAdmin($order, 'delivery_failed', $note, $adminId),
            'cancel_order' => $this->updateStateByAdmin($order, 'cancelled', $note, $adminId),
            default => throw new \InvalidArgumentException('Accion administrativa no soportada.'),
        };
    }

    public function applyAdminActionBulk(array $orderIds, string $action, ?string $note = null, ?string $adminId = null): array
    {
        $updatedIds = [];
        $failed = [];

        DB::transaction(function () use ($orderIds, $action, $note, $adminId, &$updatedIds, &$failed) {
            /** @var Collection<int, Order> $orders */
            $orders = Order::query()
                ->whereIn('id', $orderIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            foreach ($orderIds as $orderId) {
                /** @var Order|null $order */
                $order = $orders->get($orderId);
                if (!$order) {
                    $failed[] = [
                        'id' => $orderId,
                        'reason' => 'Orden no encontrada.',
                    ];
                    continue;
                }

                try {
                    $this->applyAdminAction($order, $action, $note, $adminId);
                    $updatedIds[] = $orderId;
                } catch (\InvalidArgumentException $exception) {
                    $failed[] = [
                        'id' => $orderId,
                        'reason' => $exception->getMessage(),
                    ];
                }
            }
        });

        return [
            'updated_ids' => $updatedIds,
            'failed' => $failed,
        ];
    }

    public function expirePendingBankTransferOrders(int $days = 5): array
    {
        $days = max(1, $days);
        $cutoff = now()->subDays($days);
        $candidateOrderIds = $this->findExpiredPendingBankTransferOrderIds($days);

        $expiredIds = [];

        foreach ($candidateOrderIds as $orderId) {
            if ($this->expirePendingBankTransferOrderById((string) $orderId, $days)) {
                $expiredIds[] = (string) $orderId;
            }
        }

        return [
            'expired_count' => count($expiredIds),
            'expired_order_ids' => $expiredIds,
            'cutoff' => $cutoff->toDateTimeString(),
        ];
    }

    /**
     * @return array<int, string>
     */
    public function findExpiredPendingBankTransferOrderIds(int $days = 5): array
    {
        $cutoff = now()->subDays(max(1, $days));

        return Order::query()
            ->where('payment_method_type', 'bank_transfer')
            ->where('state', 'pending_payment')
            ->where(function ($query) use ($cutoff) {
                $query->where(function ($sub) use ($cutoff) {
                    $sub->whereNotNull('placed_at')
                        ->where('placed_at', '<=', $cutoff);
                })->orWhere(function ($sub) use ($cutoff) {
                    $sub->whereNull('placed_at')
                        ->where('created_at', '<=', $cutoff);
                });
            })
            ->pluck('id')
            ->all();
    }

    public function expirePendingBankTransferOrderById(string $orderId, int $days = 5): bool
    {
        $days = max(1, $days);
        $cutoff = now()->subDays($days);

        return DB::transaction(function () use ($orderId, $cutoff): bool {
            /** @var Order|null $order */
            $order = Order::query()
                ->with(['items', 'payments'])
                ->lockForUpdate()
                ->find($orderId);

            if (!$order) {
                return false;
            }

            $isStillPendingTransfer = $order->payment_method_type === 'bank_transfer'
                && $order->state === 'pending_payment';
            $referenceDate = $order->placed_at ?? $order->created_at;
            $isExpired = $referenceDate && $referenceDate->lte($cutoff);

            if (!$isStillPendingTransfer || !$isExpired) {
                return false;
            }

            $previousState = $order->state;

            $order->update([
                'state' => 'cancelled',
                'cancelled_at' => now(),
                'notes' => trim(($order->notes ? $order->notes . "\n" : '') . 'Cancelada automáticamente por falta de pago (más de 5 días).'),
            ]);

            $payment = $order->payments()->latest()->first();
            if ($payment) {
                $payment->update([
                    'status' => 'failed',
                    'rejected_at' => now(),
                ]);
            }

            $this->restoreStockForOrder($order);
            $this->registerStatusHistory(
                $order,
                $previousState,
                'cancelled',
                'system',
                null,
                'Cancelación automática por vencimiento de pago en transferencia bancaria'
            );
            $this->orderNotificationService->sendStateChanged($order, $previousState, 'cancelled');

            return true;
        });
    }

    public function buildAdminStateMeta(Order $order): array
    {
        $actionsOrder = [
            'accept_payment',
            'reject_payment',
            'reset_to_pending_payment',
            'start_preparing',
            'start_transit',
            'mark_delivered_full',
            'mark_delivery_failed',
            'cancel_order',
        ];

        $allowedActions = collect($actionsOrder)
            ->filter(fn(string $action) => $this->canApplyAdminAction($order, $action))
            ->values()
            ->all();

        $rollbackState = $this->getPreviousStateForRollback($order->state, $order->payment_method_type);
        $rollbackAction = null;
        $rollbackLabel = null;

        if ($rollbackState) {
            $rollbackCandidates = [
                'start_transit',
                'start_preparing',
                'accept_payment',
                'reset_to_pending_payment',
            ];

            foreach ($rollbackCandidates as $candidate) {
                if ($this->targetStateFromAction($candidate) !== $rollbackState) {
                    continue;
                }
                if (!$this->canApplyAdminAction($order, $candidate)) {
                    continue;
                }
                $rollbackAction = $candidate;
                $rollbackLabel = 'Regresar a ' . $this->stateLabel($rollbackState);
                break;
            }
        }

        return [
            'allowed_actions' => $allowedActions,
            'rollback_action' => $rollbackAction,
            'rollback_label' => $rollbackLabel,
        ];
    }

    public function buildPricingMeta(Order $order): array
    {
        $baseDeliveryCost = $this->resolveBaseDeliveryCostForOrder($order);
        $deliveryCost = (float) $order->delivery_cost;
        $couponDiscountTotal = (float) $order->discount_total;
        $deliveryDiscountTotal = max(0.0, round($baseDeliveryCost - $deliveryCost, 2));

        return [
            'coupon_discount_total' => round($couponDiscountTotal, 2),
            'delivery_base_cost' => round($baseDeliveryCost, 2),
            'delivery_discount_total' => round($deliveryDiscountTotal, 2),
        ];
    }

    private function resolveShippingQuote(
        string $departmentId,
        string $provinceId,
        string $districtId,
        float $subtotal,
        bool $enforceMinimumOrder = true
    ): array
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
            ->where('delivery_cost', '>', 0)
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

        $thresholds = $this->resolveOrderThresholds($subtotal);
        $minimumOrder = $thresholds['minimum_purchase_amount'];
        $freeDeliveryThreshold = $thresholds['free_delivery_threshold'];

        if ($enforceMinimumOrder && $subtotal < $minimumOrder) {
            throw new \InvalidArgumentException("El monto mínimo para comprar es S/ {$minimumOrder}.");
        }

        $deliveryCost = !is_null($freeDeliveryThreshold) && $subtotal >= $freeDeliveryThreshold
            ? 0
            : (float) $zone->delivery_cost;

        return [
            'zone_type' => $zone->zone_type,
            'zone_id' => $zone->zone_id,
            'delivery_cost' => round($deliveryCost, 2),
            'minimum_order_threshold' => $thresholds['minimum_purchase_amount'],
            'amount_missing_for_minimum_purchase' => $thresholds['amount_missing_for_minimum_purchase'],
            'free_delivery_threshold' => $thresholds['free_delivery_threshold'],
            'amount_to_free_delivery' => $thresholds['amount_to_free_delivery'],
            'department_name' => $department->name,
            'province_name' => $province->name,
            'district_name' => $district->name,
        ];
    }

    private function resolveOrderThresholds(float $subtotal): array
    {
        $settings = DeliverySetting::query()->first();
        $minimumPurchaseAmount = round((float) ($settings?->order_amount_threshold ?? 0), 2);
        $rawFreeDeliveryThreshold = $settings?->minimum_order_amount;
        $freeDeliveryThreshold = is_null($rawFreeDeliveryThreshold) ? null : round((float) $rawFreeDeliveryThreshold, 2);

        return [
            'minimum_purchase_amount' => $minimumPurchaseAmount,
            'amount_missing_for_minimum_purchase' => max(0, round($minimumPurchaseAmount - $subtotal, 2)),
            'free_delivery_threshold' => $freeDeliveryThreshold,
            'amount_to_free_delivery' => is_null($freeDeliveryThreshold)
                ? 0.0
                : max(0, round($freeDeliveryThreshold - $subtotal, 2)),
        ];
    }

    private function resolveBaseDeliveryCostForOrder(Order $order): float
    {
        $zone = DeliveryZone::query()
            ->where(function ($query) use ($order) {
                $query->where(fn($q) => $q->where('zone_type', 'district')->where('zone_id', $order->district_id))
                    ->orWhere(fn($q) => $q->where('zone_type', 'province')->where('zone_id', $order->province_id))
                    ->orWhere(fn($q) => $q->where('zone_type', 'department')->where('zone_id', $order->department_id));
            })
            ->orderByRaw("CASE zone_type WHEN 'district' THEN 1 WHEN 'province' THEN 2 ELSE 3 END")
            ->first();

        return $zone ? (float) $zone->delivery_cost : (float) $order->delivery_cost;
    }

    private function resolveVariants(array $items, bool $lockForUpdate = false): array
    {
        $ids = collect($items)
            ->where('item_type', 'product_variant')
            ->pluck('variant_id')
            ->filter()
            ->unique()
            ->values();

        if ($ids->isEmpty()) {
            return [];
        }

        $query = ProductVariant::query()
            ->whereIn('id', $ids)
            ->where('is_active', true)
            ->with([
                'product:id,name',
                'product.categories:id',
                'product.businessLines:id',
                'attributes.attribute:id,name',
                'mainImage:id,mediable_id,mediable_type,file_path',
            ]);

        if ($lockForUpdate) {
            $query->lockForUpdate();
        }

        $variants = $query->get()->keyBy('id');

        if ($variants->count() !== $ids->count()) {
            throw new \InvalidArgumentException('Uno o más productos no son válidos o no están activos.');
        }

        return $variants->all();
    }

    private function resolvePacks(array $items, bool $lockForUpdate = false): array
    {
        $ids = collect($items)
            ->where('item_type', 'product_pack')
            ->pluck('pack_id')
            ->filter()
            ->unique()
            ->values();

        if ($ids->isEmpty()) {
            return [];
        }

        $query = ProductPack::query()
            ->whereIn('id', $ids)
            ->where('is_active', true)
            ->with([
                'mainImage:id,mediable_id,mediable_type,file_path',
            ]);

        if ($lockForUpdate) {
            $query->lockForUpdate();
        }

        $packs = $query->get()->keyBy('id');

        if ($packs->count() !== $ids->count()) {
            throw new \InvalidArgumentException('Uno o más packs no son válidos o no están activos.');
        }

        return $packs->all();
    }

    private function calculateSubtotal(array $items, array $variants, array $packs = []): float
    {
        $subtotal = 0;

        foreach ($items as $item) {
            if ($item['item_type'] === 'product_pack') {
                /** @var ProductPack $pack */
                $pack = $packs[$item['pack_id']];
                $quantity = (int) $item['quantity'];

                if ($pack->stock < $quantity) {
                    throw new \InvalidArgumentException("Stock insuficiente para el pack {$pack->name}.");
                }

                $subtotal += (float) $pack->active_price * $quantity;
                continue;
            }

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

    private function previewItemsPayload(array $items, array $variants, array $packs = []): array
    {
        return collect($items)->map(function ($item) use ($variants, $packs) {
            if ($item['item_type'] === 'product_pack') {
                /** @var ProductPack $pack */
                $pack = $packs[$item['pack_id']];

                return [
                    'item_type' => 'product_pack',
                    'pack_id' => $pack->id,
                    'product_name' => $pack->name,
                    'quantity' => (int) $item['quantity'],
                    'unit_price' => (float) $pack->active_price,
                    'line_total' => (float) $pack->active_price * (int) $item['quantity'],
                    'stock_available' => (int) $pack->stock,
                ];
            }

            /** @var ProductVariant $variant */
            $variant = $variants[$item['variant_id']];

            return [
                'item_type' => 'product_variant',
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
            ->map(function ($item) {
                $type = ((string) data_get($item, 'type', 'product')) === 'pack'
                    ? 'product_pack'
                    : 'product_variant';

                return [
                    'item_type' => $type,
                    'variant_id' => $type === 'product_variant' ? (string) data_get($item, 'variant_id') : null,
                    'pack_id' => $type === 'product_pack' ? (string) data_get($item, 'pack_id') : null,
                    'quantity' => (int) data_get($item, 'quantity', 0),
                ];
            })
            ->groupBy(fn($item) => $item['item_type'] . ':' . ($item['variant_id'] ?? $item['pack_id']))
            ->map(function ($group) {
                $first = $group->first();

                return [
                    'item_type' => $first['item_type'],
                    'variant_id' => $first['variant_id'],
                    'pack_id' => $first['pack_id'],
                    'quantity' => $group->sum(fn($item) => (int) ($item['quantity'] ?? 0)),
                ];
            })
            ->filter(fn($item) => $item['quantity'] > 0)
            ->values()
            ->all();
    }

    private function extractShippingInput(array $payload): ?array
    {
        $shippingInfo = $payload['shipping_info'] ?? [
            'department_id' => data_get($payload, 'department_id'),
            'province_id' => data_get($payload, 'province_id'),
            'district_id' => data_get($payload, 'district_id'),
        ];

        $departmentId = trim((string) data_get($shippingInfo, 'department_id'));
        $provinceId = trim((string) data_get($shippingInfo, 'province_id'));
        $districtId = trim((string) data_get($shippingInfo, 'district_id'));

        if ($departmentId === '' || $provinceId === '' || $districtId === '') {
            return null;
        }

        return [
            'department_id' => $departmentId,
            'province_id' => $provinceId,
            'district_id' => $districtId,
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

    private function restoreStockForOrder(Order $order): void
    {
        foreach ($order->items as $item) {
            if ($item->item_type === 'product_pack' && $item->pack_id) {
                $pack = ProductPack::query()
                    ->where('id', $item->pack_id)
                    ->lockForUpdate()
                    ->first();

                if ($pack) {
                    $pack->increment('stock', (int) $item->quantity);
                }
                continue;
            }

            if ($item->variant_id) {
                $variant = ProductVariant::query()
                    ->where('id', $item->variant_id)
                    ->lockForUpdate()
                    ->first();

                if ($variant) {
                    $variant->increment('stock', (int) $item->quantity);
                }
            }
        }
    }

    private function reserveStockForOrder(Order $order): void
    {
        foreach ($order->items as $item) {
            $quantity = (int) $item->quantity;

            if ($item->item_type === 'product_pack' && $item->pack_id) {
                $pack = ProductPack::query()
                    ->where('id', $item->pack_id)
                    ->lockForUpdate()
                    ->first();

                if (!$pack) {
                    throw new \InvalidArgumentException("No existe el pack {$item->pack_id} para reactivar la orden.");
                }

                if ($pack->stock < $quantity) {
                    throw new \InvalidArgumentException("No hay stock suficiente para reactivar la orden en pack {$pack->name}.");
                }

                $pack->decrement('stock', $quantity);
                continue;
            }

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

            if ($variant->stock < $quantity) {
                throw new \InvalidArgumentException("No hay stock suficiente para reactivar la orden en SKU {$variant->sku}.");
            }

            $variant->decrement('stock', $quantity);
        }
    }

    private function assertStateTransition(string $from, string $to): void
    {
        if ($from === $to) {
            return;
        }

        $map = [
            'pending_payment' => ['payment_received', 'payment_failed', 'cancelled'],
            'payment_received' => ['preparing', 'pending_payment', 'cancelled', 'refunded'],
            'preparing' => ['in_delivery', 'payment_received', 'cancelled'],
            'in_delivery' => ['delivered', 'delivery_failed', 'preparing', 'cancelled'],
            'delivery_failed' => ['in_delivery', 'preparing', 'cancelled'],
            'delivered' => ['in_delivery', 'preparing'],
            'payment_failed' => ['pending_payment', 'payment_received', 'cancelled'],
            'cancelled' => ['pending_payment', 'payment_received', 'preparing'],
            'refunded' => ['pending_payment', 'payment_received'],
        ];

        if (!in_array($to, $map[$from] ?? [], true)) {
            throw new \InvalidArgumentException("Transición de estado no permitida: {$from} -> {$to}.");
        }
    }

    private function isStateTransitionAllowed(string $from, string $to): bool
    {
        if ($from === $to) {
            return false;
        }

        $map = [
            'pending_payment' => ['payment_received', 'payment_failed', 'cancelled'],
            'payment_received' => ['preparing', 'pending_payment', 'cancelled', 'refunded'],
            'preparing' => ['in_delivery', 'payment_received', 'cancelled'],
            'in_delivery' => ['delivered', 'delivery_failed', 'preparing', 'cancelled'],
            'delivery_failed' => ['in_delivery', 'preparing', 'cancelled'],
            'delivered' => ['in_delivery', 'preparing'],
            'payment_failed' => ['pending_payment', 'payment_received', 'cancelled'],
            'cancelled' => ['pending_payment', 'payment_received', 'preparing'],
            'refunded' => ['pending_payment', 'payment_received'],
        ];

        return in_array($to, $map[$from] ?? [], true);
    }

    private function targetStateFromAction(string $action): ?string
    {
        return match ($action) {
            'accept_payment' => 'payment_received',
            'reject_payment' => 'payment_failed',
            'reset_to_pending_payment' => 'pending_payment',
            'start_preparing' => 'preparing',
            'schedule_shipping', 'start_transit' => 'in_delivery',
            'mark_delivered_full' => 'delivered',
            'mark_delivery_failed' => 'delivery_failed',
            'cancel_order' => 'cancelled',
            default => null,
        };
    }

    private function canApplyAdminAction(Order $order, string $action): bool
    {
        $targetState = $this->targetStateFromAction($action);
        if (!$targetState) {
            return false;
        }

        $from = $order->state;
        $isNiubizConfirmed = $order->payment_method_type === 'niubiz'
            && in_array($from, ['payment_received', 'preparing', 'in_delivery', 'delivered', 'refunded'], true);

        if ($isNiubizConfirmed && in_array($targetState, ['pending_payment', 'payment_failed'], true)) {
            return false;
        }

        return $this->isStateTransitionAllowed($from, $targetState);
    }

    private function getPreviousStateForRollback(string $state, ?string $paymentMethodType): ?string
    {
        return match ($state) {
            'pending_payment' => null,
            'payment_received' => $paymentMethodType === 'bank_transfer' ? 'pending_payment' : null,
            'preparing' => 'payment_received',
            'in_delivery' => 'preparing',
            'delivered' => 'in_delivery',
            'delivery_failed' => 'in_delivery',
            'payment_failed' => 'pending_payment',
            'cancelled' => 'preparing',
            'refunded' => 'payment_received',
            default => null,
        };
    }

    private function stateLabel(string $state): string
    {
        return match ($state) {
            'pending_payment' => 'Pendiente de pago',
            'payment_received' => 'Pago recibido',
            'preparing' => 'En preparacion',
            'in_delivery' => 'En envio',
            'delivered' => 'Entregado',
            'delivery_failed' => 'Entrega fallida',
            'payment_failed' => 'Pago no exitoso',
            'cancelled' => 'Cancelado',
            'refunded' => 'Reembolsado',
            default => $state,
        };
    }

    private function mapLegacyOrderStatusToState(string $status): string
    {
        return match ($status) {
            'pending', 'confirmed' => 'pending_payment',
            'preparing' => 'preparing',
            'shipped' => 'in_delivery',
            'delivered' => 'delivered',
            'cancelled' => 'cancelled',
            default => 'pending_payment',
        };
    }

    private function mapLegacyPaymentStatusToState(string $status): string
    {
        return match ($status) {
            'approved' => 'payment_received',
            'rejected', 'failed' => 'payment_failed',
            'refunded' => 'refunded',
            'pending' => 'pending_payment',
            default => 'pending_payment',
        };
    }

    private function mapLegacyShippingStatusToState(string $status): string
    {
        return match ($status) {
            'assigned', 'in_transit' => 'in_delivery',
            'delivered' => 'delivered',
            'failed' => 'delivery_failed',
            'pending' => 'preparing',
            default => 'preparing',
        };
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
        for ($i = 0; $i < 5; $i++) {
            $numericPart = str_pad((string) random_int(0, 999999999999), 12, '0', STR_PAD_LEFT);
            $code = 'DAR-' . $numericPart;

            if (!Order::query()->where('code', $code)->exists()) {
                return $code;
            }
        }

        throw new \RuntimeException('No se pudo generar un código único de orden.');
    }
}
