<?php

namespace App\Http\Web\Controllers\Dashboard;

use App\Http\Web\Controllers\Controller;
use App\Http\Web\Services\Dashboard\DashboardService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashBoardController extends Controller
{
    protected DashboardService $dashboardService;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    public function index(Request $request): Response
    {
        
        $from = $request->input('from') 
            ? Carbon::parse($request->input('from'))->startOfDay() 
            : Carbon::now()->startOfMonth()->startOfDay();

        $to = $request->input('to') 
            ? Carbon::parse($request->input('to'))->endOfDay() 
            : Carbon::now()->endOfDay();
        $fromDateStr = $from->toDateTimeString();
        $toDateStr = $to->toDateTimeString();

        return Inertia::render('dashboard/dashboard', [
            'filters' => [
                'from' => $from->toDateString(),
                'to'   => $to->toDateString(),
            ],
            'kpiData'         => $this->dashboardService->getKPIData($fromDateStr, $toDateStr),
            'salesData'       => $this->dashboardService->getSalesData($fromDateStr), 
            'topProductsData' => $this->dashboardService->getTopProducts($fromDateStr, $toDateStr),
            'categoryData'    => $this->dashboardService->getCategoryData($fromDateStr, $toDateStr),
        ]);
    }
}