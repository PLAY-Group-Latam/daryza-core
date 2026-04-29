<?php

namespace App\Http\Web\Services\Dashboard;

use App\Models\Events\EventLog;
use App\Models\Orders\Order;
use App\Models\Products\ProductCategory;
use App\Models\Orders\OrderPayment;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    // Definimos los estados que NO deben contabilizarse como ventas
    private array $excludedStates = ['cancelled', 'pending_payment'];

    public function getKPIData($fromDate, $toDate): array
    {
        $from = Carbon::parse($fromDate);
        $to = Carbon::parse($toDate);
        $days = $from->diffInDays($to);

        $previousFrom = $from->copy()->subDays($days + 1);
        $previousTo = $to->copy()->subDays($days + 1);

        // Periodo actual
        $currentSales = OrderPayment::whereHas('order', function ($query) {
                $query->whereNotIn('state', $this->excludedStates);
            })
            ->whereBetween('paid_at', [$fromDate, $toDate])
            ->sum('amount');

        $currentOrders = Order::whereNotIn('state', $this->excludedStates)
            ->whereHas('payments', function ($query) use ($fromDate, $toDate) {
                $query->whereBetween('paid_at', [$fromDate, $toDate]);
            })->count();

        // Periodo anterior
        $previousSales = OrderPayment::whereHas('order', function ($query) {
                $query->whereNotIn('state', $this->excludedStates);
            })
            ->whereBetween('paid_at', [$previousFrom, $previousTo])
            ->sum('amount');

        $previousOrders = Order::whereNotIn('state', $this->excludedStates)
            ->whereHas('payments', function ($query) use ($previousFrom, $previousTo) {
                $query->whereBetween('paid_at', [$previousFrom, $previousTo]);
            })->count();

        $averageTicket = $currentOrders > 0 ? $currentSales / $currentOrders : 0;
        $previousTicket = $previousOrders > 0 ? $previousSales / $previousOrders : 0;

        // Conversión actual
        $currentCartsStarted = EventLog::where('event_type', 'add_to_cart')
            ->whereBetween('created_at', [$fromDate, $toDate])
            ->whereNotNull('customer_id')
            ->distinct('customer_id')
            ->count('customer_id');

        $currentPaymentsDone = EventLog::where('event_type', 'payment_result_success')
            ->whereBetween('created_at', [$fromDate, $toDate])
            ->whereNotNull('customer_id')
            ->distinct('customer_id')
            ->count('customer_id');

        $conversionRate = $currentCartsStarted > 0
            ? round(($currentPaymentsDone / $currentCartsStarted) * 100, 2)
            : 0;

        // Conversión anterior
        $previousCartsStarted = EventLog::where('event_type', 'add_to_cart')
            ->whereBetween('created_at', [$previousFrom, $previousTo])
            ->whereNotNull('customer_id')
            ->distinct('customer_id')
            ->count('customer_id');

        $previousPaymentsDone = EventLog::where('event_type', 'payment_result_success')
            ->whereBetween('created_at', [$previousFrom, $previousTo])
            ->whereNotNull('customer_id')
            ->distinct('customer_id')
            ->count('customer_id');

        $previousConversionRate = $previousCartsStarted > 0
            ? round(($previousPaymentsDone / $previousCartsStarted) * 100, 2)
            : 0;

        return [
            'totalSales'       => (float) round($currentSales, 2),
            'totalOrders'      => (int) $currentOrders,
            'averageTicket'    => (float) round($averageTicket, 2),
            'salesGrowth'      => $this->calculateGrowth($currentSales, $previousSales),
            'ordersGrowth'     => $this->calculateGrowth($currentOrders, $previousOrders),
            'ticketGrowth'     => $this->calculateGrowth($averageTicket, $previousTicket),
            'conversionRate'   => $conversionRate,
            'conversionGrowth' => $this->calculateGrowth($conversionRate, $previousConversionRate),
        ];
    }

    public function getSalesData($fromDate)
    {
        $year = Carbon::parse($fromDate)->year;

        $rawData = OrderPayment::whereHas('order', function ($query) {
                $query->whereNotIn('state', $this->excludedStates);
            })
            ->whereYear('paid_at', $year)
            ->selectRaw('EXTRACT(MONTH FROM paid_at) as month_num, SUM(amount) as sales, COUNT(DISTINCT order_id) as orders')
            ->groupBy('month_num')
            ->get()
            ->keyBy('month_num');

        $monthsMapping = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

        return collect($monthsMapping)->map(function ($name, $index) use ($rawData) {
            $monthNum = $index + 1;
            $data = $rawData->get($monthNum);

            return [
                'month'  => $name,
                'sales'  => (float) ($data->sales ?? 0),
                'orders' => (int) ($data->orders ?? 0),
            ];
        })->values();
    }

    public function getTopProducts($fromDate, $toDate)
    {
        $topProducts = DB::table('products as p')
            ->join('product_variants as pv', 'p.id', '=', 'pv.product_id')
            ->join('order_items as oi', 'pv.id', '=', 'oi.variant_id')
            ->join('orders as o', 'oi.order_id', '=', 'o.id') // Unimos orders
            ->whereNotIn('o.state', $this->excludedStates)    // Filtramos por estado
            ->whereBetween('o.created_at', [$fromDate, $toDate]) // Usamos fecha de orden para mejor precisión
            ->select(
                'p.name as product',
                DB::raw('SUM(oi.line_total) as revenue'),
                DB::raw('SUM(oi.quantity) as sales')
            )
            ->groupBy('p.id', 'p.name')
            ->orderByDesc('revenue')
            ->limit(5)
            ->get();

        return collect($topProducts)->map(fn($item) => [
            'product' => $item->product,
            'revenue' => (float) $item->revenue,
            'sales'   => (int) $item->sales,
        ]);
    }

    public function getCategoryData($fromDate, $toDate)
    {
        $rootCategoryIds = ProductCategory::roots()->pluck('id');

        $categories = DB::table('product_category as pc')
            ->join('product_categories as c', 'pc.category_id', '=', 'c.id')
            ->join('order_items as oi', 'pc.product_id', '=', 'oi.product_id')
            ->join('orders as o', 'oi.order_id', '=', 'o.id') // Unimos orders
            ->whereNotIn('o.state', $this->excludedStates)    // Filtramos por estado
            ->whereBetween('o.created_at', [$fromDate, $toDate])
            ->whereIn('c.id', $rootCategoryIds)
            ->select(
                'c.name',
                DB::raw('SUM(oi.quantity) as units'),
                DB::raw('SUM(oi.line_total) as revenue')
            )
            ->groupBy('c.id', 'c.name')
            ->orderByDesc('revenue')
            ->get();

        return collect($categories)->map(fn($item) => [
            'name'    => $item->name,
            'units'   => (int) $item->units,
            'revenue' => (float) $item->revenue,
        ]);
    }

    private function calculateGrowth(float $current, float $previous): float
    {
        if ($previous <= 0) {
            return 0;
        }

        return round((($current - $previous) / $previous) * 100, 2);
    }
}