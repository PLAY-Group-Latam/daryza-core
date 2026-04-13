<?php

namespace App\Http\Web\Exports;

use App\Models\Orders\Order;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class OrdersExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
{
    public function __construct(private readonly array $filters = []) {}

    public function collection()
    {
        $query = Order::query()
            ->with(['items', 'payments'])
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

        return $query->get();
    }

    public function headings(): array
    {
        return [
            'codigo',
            'estado',
            'fecha_pedido',
            'cliente',
            'email',
            'telefono',
            'tipo_documento',
            'numero_documento',
            'moneda',
            'subtotal',
            'descuento',
            'costo_envio',
            'total',
            'metodo_pago',
            'estado_pago',
            'monto_pago',
            'items_total',
            'cantidad_total',
            'direccion_envio',
            'referencia_envio',
            'distrito',
            'provincia',
            'departamento',
            'ruc_facturacion',
            'razon_social_facturacion',
        ];
    }

    public function map($order): array
    {
        $latestPayment = $order->payments->sortByDesc('created_at')->first();
        $itemsCount = $order->items->count();
        $itemsQuantity = $order->items->sum('quantity');
        $placedAt = $order->placed_at ?? $order->created_at;

        return [
            (string) $order->code,
            $this->mapOrderStateLabel((string) $order->state),
            $placedAt ? $placedAt->format('d/m/Y H:i') : '',
            trim((string) $order->customer_first_name . ' ' . (string) $order->customer_last_name),
            (string) $order->customer_email,
            (string) $order->customer_mobile_phone,
            (string) $order->customer_document_type,
            (string) $order->customer_document_number,
            (string) $order->currency,
            (float) $order->subtotal,
            (float) $order->discount_total,
            (float) $order->delivery_cost,
            (float) $order->total,
            (string) $order->payment_method_type,
            $this->mapPaymentStatusLabel((string) ($latestPayment?->status ?? '')),
            (float) ($latestPayment?->amount ?? 0),
            $itemsCount,
            $itemsQuantity,
            (string) $order->shipping_address_line,
            (string) $order->shipping_reference,
            (string) $order->district_name,
            (string) $order->province_name,
            (string) $order->department_name,
            (string) $order->billing_ruc,
            (string) $order->billing_social_reason,
        ];
    }

    private function mapOrderStateLabel(string $state): string
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
