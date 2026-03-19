<?php

namespace App\Http\Api\v1\Controllers\Distributors;

use App\Http\Api\v1\Controllers\Controller;
use App\Http\Api\v1\Services\Distributors\DistributorService; 
use App\Http\Api\v1\Resources\Distributor\DistributorResource; 
use App\Http\Api\Traits\ApiTrait;
use App\Models\Distributors\Distributor;
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

    public function index()
    {
        try {
            $distributors = $this->distributorService->getAllForMap();

            return $this->success(
                'Distribuidores recuperados exitosamente',
                DistributorResource::collection($distributors)
            );
            
        } catch (Exception $e) {
            return $this->error(
                'Error al obtener los distribuidores',
                $e->getMessage(),
                500
            );
        }
    }

    public function show($id)
    {
        try {
            $distributor = Distributor::findOrFail($id);
    
            return $this->success(
                'Detalle del distribuidor', 
                new DistributorResource($distributor)
            );
            
        } catch (Exception $e) {
            return $this->error('Distribuidor no encontrado', null, 404);
        }
    }
}