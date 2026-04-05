<?php

namespace App\Http\Api\v1\Controllers\Products;

use App\Http\Api\v1\Controllers\Controller;
use App\Http\Api\v1\Services\Products\BusinessLineService;
use App\Http\Api\v1\Resources\Products\BusinessLineResource;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class BusinessLineController extends Controller
{
    public function __construct(
        protected BusinessLineService $businessLineService
    ) {}

  
    public function index(): AnonymousResourceCollection
    {
        $businessLines = $this->businessLineService->getActiveBusinessLines();

        return BusinessLineResource::collection($businessLines);
    }
}