<?php

namespace App\Http\Api\v1\Controllers\Products;

use App\Http\Api\v1\Controllers\Controller;
use App\Http\Api\Traits\ApiTrait;
use App\Http\Api\v1\Services\Products\ProductFilterService;
use Illuminate\Http\Request;

class ProductFilterController extends Controller
{
    use ApiTrait;

    public function __construct(protected ProductFilterService $filterService) {}

    public function index(Request $request)
    {
        try {
            return $this->success(
                message: 'Catálogo cargado.',
                data: $this->filterService->applyFilters($request->all())
            );
        } catch (\Exception $e) {
            return $this->error('Error al obtener el catálogo', $e->getMessage());
        }
    }
}