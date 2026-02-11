<?php

namespace App\Http\Api\v1\Controllers\Leads;

use App\Http\Api\v1\Controllers\Controller;
use App\Http\Api\v1\Requests\Leads\AboutUsRequest;
use App\Http\Api\v1\Services\Leads\AboutUsService;
use App\Http\Api\Traits\ApiTrait;
use Illuminate\Http\JsonResponse;

class AboutUsApiController extends Controller
{
    use ApiTrait;

    protected AboutUsService $aboutUsService;

    public function __construct(AboutUsService $aboutUsService)
    {
        $this->aboutUsService = $aboutUsService;
    }
    
    public function store(AboutUsRequest $request): JsonResponse
    {
        try {
           
            $data = $this->aboutUsService->save($request->validated());

            return $this->created(
                '¡Gracias! Tu mensaje para el equipo de "Nosotros" ha sido recibido.',
                $data
            );
        } catch (\Exception $e) {
            return $this->error(
                'Hubo un error al procesar la solicitud de About Us.',
                $e->getMessage(),
                500
            );
        }
    }
}