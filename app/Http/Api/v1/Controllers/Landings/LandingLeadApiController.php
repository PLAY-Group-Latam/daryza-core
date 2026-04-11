<?php

namespace App\Http\Api\v1\Controllers\Landings;

use App\Http\Api\Traits\ApiTrait;
use App\Http\Api\v1\Controllers\Controller;
use App\Http\Api\v1\Requests\Landings\StoreLandingLeadRequest;
use App\Http\Api\v1\Services\Landings\LandingLeadService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;

class LandingLeadApiController extends Controller
{
    use ApiTrait;

    public function __construct(
        protected LandingLeadService $landingLeadService
    ) {}

    public function store(StoreLandingLeadRequest $request, string $slug): JsonResponse
    {
        try {
            $lead = $this->landingLeadService->save(
                $slug,
                $request->validated(),
                $request->ip(),
                $request->userAgent()
            );

            return $this->created('Lead registrado correctamente.', $lead);
        } catch (ModelNotFoundException) {
            return $this->error('Landing no encontrada o inactiva.', null, 404);
        } catch (\Throwable $e) {
            return $this->error('No se pudo registrar el lead.', $e->getMessage(), 500);
        }
    }
}
