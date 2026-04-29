<?php

namespace App\Http\Api\v1\Controllers\Products;

use App\Http\Api\v1\Controllers\Controller;
use App\Http\Api\v1\Services\Products\ProductCategoryService;
use App\Http\Api\Traits\ApiTrait;

class ProductCategoryController extends Controller
{
   
    use ApiTrait;

    /**
     * @param ProductCategoryService $service
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(ProductCategoryService $service)
    {
    
        return $this->success(
            message: 'Navegación obtenida', 
            data: $service->getMenu()
        );
    }
}