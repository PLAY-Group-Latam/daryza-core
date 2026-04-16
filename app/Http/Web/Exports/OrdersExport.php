<?php

namespace App\Http\Web\Exports;

use App\Models\Orders\Order;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;

class OrdersExport implements FromCollection, WithHeadings, ShouldAutoSize
{
    public function __construct(private readonly array $filters = []) {}

    public function collection()
    {
        $query = Order::query()
            ->with(['items.variant.attributes.attribute', 'payments'])
            ->orderByDesc('created_at');

        $state = $this->filters['state'] ?? null;
        if (!empty($state)) {
            $query->where('state', $state);
        }

        $search = $this->filters['search'] ?? null;
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhere('customer_email', 'like', "%{$search}%")
                    ->orWhere('customer_document_number', 'like', "%{$search}%");
            });
        }

        return $query->get()->flatMap(function (Order $order): Collection {
            $latestPayment = $order->payments->sortByDesc('created_at')->first();
            $placedAt = $order->placed_at ?? $order->created_at;
            $customerName = trim((string) $order->customer_first_name . ' ' . (string) $order->customer_last_name);
            $paymentMethod = $this->mapPaymentMethodForExport((string) $order->payment_method_type, $latestPayment?->toArray() ?? []);
            $paymentStatus = $this->mapPaymentStatusLabel((string) ($latestPayment?->status ?? ''));

            return $order->items->map(function ($item) use ($order, $placedAt, $customerName, $paymentMethod, $paymentStatus) {
                return [
                    (string) $order->code,
                    $placedAt ? $placedAt->format('d/m/Y H:i') : '',
                    $customerName,
                    (string) $order->customer_mobile_phone,
                    (string) $order->customer_email,
                    (string) $order->customer_document_type,
                    (string) $order->customer_document_number,
                    (string) $order->department_name,
                    (string) $order->province_name,
                    (string) $order->district_name,
                    $paymentMethod,
                    $paymentStatus,
                    (string) ($item->variant_sku ?? ''),
                    (string) ($item->variant?->sku_supplier ?? ''),
                    $this->buildProductWithVariant((string) ($item->product_name ?? ''), $item->variant),
                    (int) ($item->quantity ?? 0),
                    (float) $order->subtotal,
                    (float) $order->discount_total,
                    (float) $order->delivery_cost,
                    (float) $order->total,
                    $this->buildShippingAddress($order),
                    (string) $order->billing_ruc,
                    (string) $order->billing_social_reason,
                ];
            });
        })->values();
    }

    public function headings(): array
    {
        return [
            'num_orden',
            'fecha_pedido',
            'cliente',
            'telefono',
            'email',
            'tipo_documento',
            'numero_documento',
            'departamento',
            'provincia',
            'distrito',
            'metodo_pago',
            'estado_pago',
            'sku_daryza',
            'sku_proovedor',
            'producto_describir_el_nombre_y_sus_variantes',
            'cantidad',
            'subtotal',
            'descuento',
            'costo_de_envio',
            'total',
            'direccion_de_envio',
            'ruc_facturacion',
            'razon_social_facturacion',
        ];
    }

    private function buildShippingAddress(Order $order): string
    {
        $segments = array_filter([
            trim((string) $order->shipping_address_line),
            trim((string) $order->shipping_number),
            trim((string) $order->shipping_floor_apartment),
            trim((string) $order->shipping_reference),
        ], fn($value) => $value !== '');

        return implode(', ', $segments);
    }

    private function buildProductWithVariant(string $productName, $variant): string
    {
        $variantAttributes = collect($variant?->attributes ?? [])
            ->map(function ($attributeValue) {
                $name = trim((string) data_get($attributeValue, 'attribute.name'));
                $value = trim((string) data_get($attributeValue, 'value'));

                if ($name === '' && $value === '') {
                    return null;
                }

                return $name !== '' ? "{$name}: {$value}" : $value;
            })
            ->filter()
            ->values()
            ->implode(', ');

        if ($variantAttributes === '') {
            return $productName;
        }

        return trim($productName) . ' (' . $variantAttributes . ')';
    }

    private function mapPaymentMethodForExport(string $method, array $latestPayment): string
    {
        if ($method === 'bank_transfer') {
            return 'Transferencia bancaria';
        }

        if ($method !== 'niubiz') {
            return $method;
        }

        $gatewayBrand = strtolower((string) ($latestPayment['gateway_brand'] ?? ''));
        $payloadString = strtolower(json_encode($latestPayment['gateway_payload'] ?? []));

        if (str_contains($gatewayBrand, 'yape') || str_contains($payloadString, 'yape')) {
            return 'Yape';
        }

        return 'Tarjeta de Crédito/Débito';
    }

    private function mapPaymentStatusLabel(string $status): string
    {
        return match ($status) {
            'approved' => 'Aprobado',
            'rejected' => 'Rechazado',
            'failed' => 'Fallido',
            'pending' => 'Pendiente',
            'refunded' => 'Reembolsado',
            default => $status,
        };
    }
}
