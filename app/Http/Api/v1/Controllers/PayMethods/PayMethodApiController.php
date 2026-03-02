<?php

namespace App\Http\Api\v1\Controllers\PayMethods;

use App\Http\Api\v1\Controllers\Controller;
use App\Http\Api\Traits\ApiTrait;
use App\Http\Api\v1\Services\PayMethod\PayMethodService;
use Illuminate\Http\JsonResponse;

class PayMethodApiController extends Controller
{
    use ApiTrait;

    /**
     * @var PayMethodService
     */
    protected $payMethodService;

    /**
     * Inyección de dependencias mediante el constructor.
     * * @param PayMethodService $payMethodService
     */
    public function __construct(PayMethodService $payMethodService)
    {
        $this->payMethodService = $payMethodService;
    }

    /**
     * Obtener todos los métodos de pago.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        // Usamos el servicio para obtener la data
        $payMethods = $this->payMethodService->getAllPayMethods();

        if ($payMethods->isEmpty()) {
            return $this->sendError('No se encontraron métodos de pago disponibles.', 404);
        }

        return $this->sendResponse(
            'Métodos de pago recuperados con éxito.',
            $payMethods
        );
    }

    /**
     * Obtener solo los métodos de pago activos.
     *
     * @return JsonResponse
     */
    public function actives(): JsonResponse
    {
        $activeMethods = $this->payMethodService->getActivePayMethods();

        if ($activeMethods->isEmpty()) {
            return $this->sendError('No hay métodos de pago activos en este momento.', 404);
        }

        return $this->sendResponse(
            'Métodos de pago activos recuperados con éxito.',
            $activeMethods
        );
    }
}