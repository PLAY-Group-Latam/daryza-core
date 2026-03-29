<?php

namespace App\Http\Api\v1\Controllers\Distributors;

use App\Http\Api\v1\Controllers\Controller;
use App\Http\Api\v1\Services\Distributors\DistributorService; 
use App\Http\Api\v1\Resources\Distributor\DistributorResource; 
use App\Http\Api\Traits\ApiTrait;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Exception;

class DistributorController extends Controller
{
    use ApiTrait;

    protected DistributorService $distributorService;

    public function __construct(DistributorService $distributorService)
    {
        $this->distributorService = $distributorService;
    }

    /**
     * Obtiene todos los distribuidores (ideal para el mapa).
     */
    public function index()
    {
        try {
            // Traemos la colección completa desde el servicio
            $distributors = $this->distributorService->getAllForMap();

            // 💡 Sacamos la URL del pin del primer elemento (si existe alguno)
            $globalMapPin = $distributors->first()?->map_pin ?? null;

            return $this->success(
                'Distribuidores recuperados exitosamente',
                [
                    'map_pin'       => $globalMapPin, // El pin viaja una sola vez 🚀
                    'distributors'  => DistributorResource::collection($distributors)
                ]
            );
            
        } catch (Exception $e) {
            return $this->error('Error al obtener los distribuidores', $e->getMessage(), 500);
        }
    }

    /**
     * Obtiene el detalle de un distribuidor específico.
     */
    public function show($id)
    {
        try {
            // 💡 Cumpliendo SOLID: El servicio es el que busca en la BD
            $distributor = $this->distributorService->findById((int) $id);
    
            return $this->success(
                'Detalle del distribuidor', 
                new DistributorResource($distributor)
            );
            
        } catch (ModelNotFoundException $e) {
            // Captura si findOrFail no encuentra el ID en el servicio
            return $this->error('Distribuidor no encontrado', null, 404);
        } catch (Exception $e) {
            return $this->error(
                'Error al obtener el distribuidor', 
                $e->getMessage(), 
                500
            );
        }
    }
}