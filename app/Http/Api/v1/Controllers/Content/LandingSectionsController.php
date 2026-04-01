<?php

namespace App\Http\Api\v1\Controllers\Content;

use App\Http\Api\v1\Controllers\Controller;
use App\Http\Api\v1\Services\Content\LandingSectionsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class LandingSectionsController extends Controller
{
    public function __construct(
        protected LandingSectionsService $landingSectionsService
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        return response()->json(
            $this->landingSectionsService->getSectionsPayload($request->query('slug'))
        );
    }
}
