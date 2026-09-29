<?php

namespace App\Http\Web\Exports;

use App\Models\Orders\Order;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Events\AfterSheet;

class OrdersExport implements FromCollection, WithHeadings, ShouldAutoSize, WithEvents
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
                    ->orWhere('customer_first_name', 'like', "%{$search}%")
                    ->orWhere('customer_last_name', 'like', "%{$search}%")
                    ->orWhereRaw("TRIM(customer_first_name || ' ' || customer_last_name) ILIKE ?", ["%{$search}%"]);
            });
        }

        $rows = new Collection();

        $query->get()->each(function (Order $order) use (&$rows) {
            $latestPayment   = $order->payments->sortByDesc('created_at')->first();
            $placedAt        = $order->placed_at ?? $order->created_at;
            $customerName    = trim((string) $order->customer_first_name . ' ' . (string) $order->customer_last_name);
            $paymentMethod   = $this->mapPaymentMethodForExport((string) $order->payment_method_type, $latestPayment?->toArray() ?? []);
            $paymentStatus   = $this->resolvePaymentStatus($order, $latestPayment?->status);
            $shippingAddress = $this->buildShippingAddress($order);

            foreach ($order->items as $item) {
                $productDesc = $this->buildProductWithVariant((string) ($item->product_name ?? ''), $item->variant);

                $rows->push([
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
                    $item->variant_sku ?? '',
                    $item->variant?->sku_supplier ?? '',
                    $productDesc,
                    (int) $item->quantity,
                    (float) $order->subtotal,
                    (float) $order->discount_total,
                    (float) $order->delivery_cost,
                    (float) $order->total,
                    $shippingAddress,
                    (string) $order->billing_ruc,
                    (string) $order->billing_social_reason,
                ]);
            }
        });

        return $rows;
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $event->sheet->getDelegate()->getStyle('A1:W' . ($event->sheet->getHighestRow()))
                    ->getAlignment()
                    ->setWrapText(true);
            },
        ];
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
            'sku_proveedor',
            'producto',
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

    private function resolvePaymentStatus(Order $order, ?string $paymentStatus): string
    {
        if (in_array($order->state, ['payment_received', 'in_preparation', 'in_delivery', 'delivered'], true)) {
            return 'Aprobado';
        }

        if ($order->state === 'cancelled') {
            return 'Cancelado';
        }

        return match ($paymentStatus) {
            'approved', 'paid' => 'Aprobado',
            'rejected' => 'Rechazado',
            'failed' => 'Fallido',
            'pending' => 'Pendiente',
            'refunded' => 'Reembolsado',
            default => 'Aprobado',
        };
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

                // Traducir / mapear códigos HEX a nombre de color si es un HEX
                if (str_starts_with($value, '#')) {
                    $value = $this->convertHexToColorName($value);
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

    /**
     * Mapea códigos HEX comunes a nombres en texto.
     */
    private function convertHexToColorName(string $hex): string
    {
        $hexUpper = strtoupper($hex);

        $colorMap = [
            '#0000FF' => 'Azul',
            '#FFA500' => 'Naranja',
            '#000000' => 'Negro',
            '#FFFFFF' => 'Blanco',
            '#FF0000' => 'Rojo',
            '#008000' => 'Verde',
            '#FFFF00' => 'Amarillo',
            '#800080' => 'Morado',
            '#808080' => 'Gris',
        ];

        return $colorMap[$hexUpper] ?? $hex;
    }

    private function mapPaymentMethodForExport(string $method, array $latestPayment): string
    {
        if ($method === 'bank_transfer') {
            return 'Transferencia bancaria o QR';
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