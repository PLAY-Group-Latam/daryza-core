<?php

namespace App\Http\Web\Controllers\PurchaseIntention;

use App\Http\Web\Controllers\Controller;
use App\Http\Web\Services\Intention\PurchaseIntentionService;
use Illuminate\Http\Request;
use App\Models\Customers\Customer;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseIntentionController extends Controller
{
    public function __construct(
        protected PurchaseIntentionService $service
    ) {}

    public function index(Request $request): Response
    {
        $paginator = $this->service->getAllPaginated($request);

        // LOG TEMPORAL: Revisa storage/logs/laravel.log
        \Illuminate\Support\Facades\Log::info("Datos de intenciones:", [
            'count' => $paginator->count(),
            'total' => $paginator->total(),
            'first_item' => $paginator->items()[0] ?? 'Sin datos'
        ]);

        // Opcional: Descomenta la línea de abajo para ver la data en el navegador y detener la ejecución
        // dd($paginator->items()); 

        return Inertia::render('intentions/Index', [
            'paginatedIntents' => [
                'data' => $paginator->items(),
                'meta' => [
                    'currentPage' => $paginator->currentPage(),
                    'lastPage'    => $paginator->lastPage(),
                    'perPage'     => $paginator->perPage(),
                    'total'       => $paginator->total(),
                ],
                'links' => $paginator->linkCollection()
            ],
            'filters' => $request->only(['search']),
        ]);
    }

    public function show(Request $request, $customerId): Response
    {
        $paginator = $this->service->getHistoryByCustomer($customerId, $request);

        return Inertia::render('intentions/Show', [
            'paginatedEvents' => [
                'data' => $paginator->items(),
                'meta' => [
                    'currentPage' => $paginator->currentPage(),
                    'lastPage'    => $paginator->lastPage(),
                    'total'       => $paginator->total(),
                ]
            ],
            // Buscamos al cliente para que aparezca en el título de la página
            'customer' => Customer::find($customerId),
            'customerId' => $customerId,
            'filters' => $request->only(['type']),
        ]);
    }
}
