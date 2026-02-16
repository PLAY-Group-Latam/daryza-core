<?php

namespace App\Http\Api\v1\Controllers\Content;

use App\Http\Api\v1\Controllers\Controller;
use App\Http\Api\Traits\ApiTrait;
use App\Http\Api\v1\Services\Content\ConfigContentService;
use Illuminate\Http\JsonResponse;

class ConfigContentController extends Controller
{
    use ApiTrait;

    public function __construct(
        protected ConfigContentService $configContentService
    ) {} 

  public function sectionsMap(): JsonResponse
{
    try {
        $map = $this->configContentService->getSectionsMap();
        
       
        return $this->success(
            'Mapa de secciones recuperado con éxito',
            ['sections_map' => $map] 
        );
        
    } catch (\Exception $e) {
    
        return $this->error('Error al generar el mapa de secciones: ' . $e->getMessage());
    }
}
}