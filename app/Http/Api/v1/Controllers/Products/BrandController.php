<?php

namespace App\Http\Api\v1\Controllers\Products;

use App\Http\Api\Traits\ApiTrait;
use App\Http\Api\v1\Resources\Products\BrandResource;
use App\Http\Api\v1\Services\Products\BrandService;

class BrandController
{
    use ApiTrait;

    public function __construct(
        protected BrandService $brandService
    ) {}

    public function index()
    {
        $brands = $this->brandService->getAll();

        return $this->success(
            'Marcas listadas correctamente',
            BrandResource::collection($brands)
        );
    }
}