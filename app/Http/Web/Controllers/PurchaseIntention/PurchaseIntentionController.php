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

    return Inertia::render('intentions/Index', [
        'paginatedIntents' => [
            'data' => $paginator->items(),
            'meta' => [
                'currentPage' => $paginator->currentPage(),
                'lastPage'    => $paginator->lastPage(),
                'perPage'     => $paginator->perPage(),
                'total'       => $paginator->total(),
            ],
        ],
        'filters' => [
            'search' => $request->query('search', '')
        ],
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
