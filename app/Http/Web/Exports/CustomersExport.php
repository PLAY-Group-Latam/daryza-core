<?php

namespace App\Http\Web\Exports;

use App\Models\Customers\Customer;
use App\Models\Orders\Order;
use App\Models\Orders\OrderPayment;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class CustomersExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
{
    /**
     * @var array<string, array{total_orders:int, total_spent:float}>
     */
    private array $metricsByCustomer = [];

    /**
     * @var array<string, string>
     */
    private array $lastOrderByCustomer = [];

    public function __construct()
    {
        $this->metricsByCustomer = $this->loadMetrics();
        $this->lastOrderByCustomer = $this->loadLastOrderDates();
    }

    public function collection()
    {
        return Customer::query()
            ->with([
                'billingProfile',
                'addresses.department',
                'addresses.province',
                'addresses.district',
            ])
            ->orderByDesc('created_at')
            ->get();
    }

    public function headings(): array
    {
        return [
            'nombre_completo',
            'email',
            'telefono',
            'dni',
            'ruc',
            'razon_social',
            'direccion',
            'ubicacion',
            'pais',
            'total_ordenes',
            'total_gastado',
            'ticket_promedio',
            'fecha_registro',
            'ultima_compra',
        ];
    }

    public function map($customer): array
    {
        $billingProfile = $customer->billingProfile;
        $primaryAddress = $customer->addresses->sortByDesc('created_at')->first();
        $metrics = $this->metricsByCustomer[$customer->id] ?? ['total_orders' => 0, 'total_spent' => 0.0];

        $totalOrders = (int) $metrics['total_orders'];
        $totalSpent = (float) $metrics['total_spent'];
        $averageOrder = $totalOrders > 0 ? $totalSpent / $totalOrders : 0.0;

        $createdAt = $customer->created_at ? $customer->created_at->format('d/m/Y H:i') : '';
        $lastOrderAt = $this->lastOrderByCustomer[$customer->id] ?? '';

        return [
            (string) $customer->full_name,
            (string) $customer->email,
            (string) $customer->phone,
            (string) $customer->dni,
            (string) ($billingProfile?->ruc ?? ''),
            (string) ($billingProfile?->social_reason ?? ''),
            (string) ($primaryAddress?->address ?? ''),
            (string) ($primaryAddress?->label ?? ''),
            (string) ($primaryAddress?->country ?? ''),
            $totalOrders,
            $totalSpent,
            $averageOrder,
            $createdAt,
            $lastOrderAt,
        ];
    }

    /**
     * @return array<string, array{total_orders:int, total_spent:float}>
     */
    private function loadMetrics(): array
    {
        return OrderPayment::query()
            ->selectRaw('orders.customer_id as customer_id')
            ->selectRaw('COUNT(DISTINCT orders.id) as total_orders')
            ->selectRaw('COALESCE(SUM(order_payments.amount), 0) as total_spent')
            ->join('orders', 'orders.id', '=', 'order_payments.order_id')
            ->where('order_payments.status', 'approved')
            ->groupBy('orders.customer_id')
            ->get()
            ->mapWithKeys(function ($row) {
                return [
                    (string) $row->customer_id => [
                        'total_orders' => (int) $row->total_orders,
                        'total_spent' => (float) $row->total_spent,
                    ],
                ];
            })
            ->all();
    }

    /**
     * @return array<string, string>
     */
    private function loadLastOrderDates(): array
    {
        return Order::query()
            ->selectRaw('customer_id, MAX(placed_at) as last_order_at')
            ->groupBy('customer_id')
            ->get()
            ->mapWithKeys(function ($row) {
                $lastOrderAt = $row->last_order_at ?? null;
                if (is_string($lastOrderAt) && trim($lastOrderAt) !== '') {
                    $lastOrderAt = \Illuminate\Support\Carbon::parse($lastOrderAt);
                }
                $value = $lastOrderAt ? $lastOrderAt->format('d/m/Y H:i') : '';
                return [(string) $row->customer_id => $value];
            })
            ->all();
    }
}
