<?php

namespace App\Http\Api\v1\Controllers\Leads;

use App\Http\Api\v1\Controllers\Controller;
use App\Http\Api\v1\Requests\Leads\JobsRequest;
use App\Http\Api\v1\Services\Leads\JobsService;
use App\Http\Api\Traits\ApiTrait;
use Illuminate\Http\JsonResponse;

class JobsApiController extends Controller
{
    use ApiTrait;

    protected JobsService $jobsService;


    public function __construct(JobsService $jobsService)
    {
        $this->jobsService = $jobsService;
    }

   
    public function store(JobsRequest $request): JsonResponse
    {
        try {
            
            $data = $this->jobsService->save($request->validated());

            return $this->created(
                '¡Postulación recibida! Tu CV ha sido enviado correctamente a nuestro equipo de Selección.',
                $data
            );
        } catch (\Exception $e) {
            
            return $this->error(
                'Hubo un error al procesar tu postulación laboral.',
                $e->getMessage(),
                500
            );
        }
    }
}