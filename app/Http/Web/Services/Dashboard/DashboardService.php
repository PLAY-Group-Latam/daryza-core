<?php

namespace App\Http\Web\Services\Dashboard;

use App\Models\Events\EventLog;
use App\Models\Orders\Order;
use App\Models\Products\ProductCategory;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    /**
     * Estados que NO deben contabilizarse como ventas.
     * Incluimos 'payment_failed' para mayor precisión.
     */
    private array $excludedStates = ['cancelled', 'pending_payment', 'payment_failed'];

    public function getKPIData($fromDate, $toDate): array
    {
        $from = Carbon::parse($fromDate)->startOfDay();
        $to = Carbon::parse($toDate)->endOfDay();

        // Cálculo de periodo anterior (espejo)
        $days = $from->diffInDays($to);
        $previousFrom = $from->copy()->subDays($days + 1);
        $previousTo = $to->copy()->subDays($days + 1);

        // --- Datos Periodo Actual ---
        $currentData = Order::whereNotIn('state', $this->excludedStates)
            ->whereBetween('created_at', [$from, $to])
            ->selectRaw('SUM(total) as sales, COUNT(id) as orders')
            ->first();

        $currentSales = (float) ($currentData->sales ?? 0);
        $currentOrders = (int) ($currentData->orders ?? 0);

        // --- Datos Periodo Anterior ---
        $previousData = Order::whereNotIn('state', $this->excludedStates)
            ->whereBetween('created_at', [$previousFrom, $previousTo])
            ->selectRaw('SUM(total) as sales, COUNT(id) as orders')
            ->first();

        $previousSales = (float) ($previousData->sales ?? 0);
        $previousOrders = (int) ($previousData->orders ?? 0);

        // --- Ticket Promedio ---
        $averageTicket = $currentOrders > 0 ? $currentSales / $currentOrders : 0;
        $previousTicket = $previousOrders > 0 ? $previousSales / $previousOrders : 0;

        // --- Conversión ---
        $currentConv = $this->calculateConversion($from, $to);
        $previousConv = $this->calculateConversion($previousFrom, $previousTo);

        return [
            'totalSales'       => (float) round($currentSales, 2),
            'totalOrders'      => (int) $currentOrders,
            'averageTicket'    => (float) round($averageTicket, 2),
            'conversionRate'   => $currentConv,
            'salesGrowth'      => $this->calculateGrowth($currentSales, $previousSales),
            'ordersGrowth'     => $this->calculateGrowth($currentOrders, $previousOrders),
            'ticketGrowth'     => $this->calculateGrowth($averageTicket, $previousTicket),
            'conversionGrowth' => $this->calculateGrowth($currentConv, $previousConv),
        ];
    }

    public function getSalesData($fromDate)
    {
        $year = Carbon::parse($fromDate)->year;

        $rawData = Order::whereNotIn('state', $this->excludedStates)
            ->whereYear('created_at', $year)
            ->selectRaw('EXTRACT(MONTH FROM created_at) as month_num, SUM(total) as sales, COUNT(id) as orders')
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
            ->join('orders as o', 'oi.order_id', '=', 'o.id')
            ->whereNotIn('o.state', $this->excludedStates)
            ->whereBetween('o.created_at', [$fromDate, $toDate])
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
            ->join('orders as o', 'oi.order_id', '=', 'o.id')
            ->whereNotIn('o.state', $this->excludedStates)
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
            return $current > 0 ? 100 : 0;
        }

        return round((($current - $previous) / $previous) * 100, 2);
    }

   private function calculateConversion($from, $to): float
{
    // 1. EL DENOMINADOR: ¿Cuánta gente entró realmente?
    // Usamos 'product_view' porque si alguien vio un producto, ya es un "interesado".
    $totalTraffic = EventLog::where('event_type', 'product_view')
        ->whereBetween('created_at', [$from, $to])
        ->distinct('session_id') // Contamos personas únicas por sesión, no solo logueados
        ->count('session_id');

    // 2. EL NUMERADOR: ¿Cuántos se convirtieron en clientes reales?
    // 'order_placed' es el evento que dispara tu Seeder y tu flujo de caja.
    $conversions = EventLog::where('event_type', 'order_placed')
        ->whereBetween('created_at', [$from, $to])
        ->distinct('session_id')
        ->count('session_id');

    // 3. LA MAGIA: (Éxitos / Visitas) * 100
    return $totalTraffic > 0 ? round(($conversions / $totalTraffic) * 100, 2) : 0;
}
}