<?php

namespace App\Http\Api\v1\Controllers\Settings;

use App\Http\Api\v1\Controllers\Controller;
use App\Http\Api\Traits\ApiTrait;
use App\Http\Api\v1\Services\Settings\PayMethodService;
use Illuminate\Http\JsonResponse;

class PayMethodApiController extends Controller
{
    use ApiTrait;

    protected PayMethodService $payMethodService;

    public function __construct(PayMethodService $payMethodService)
    {
        $this->payMethodService = $payMethodService;
    }

    public function index(): JsonResponse
    {
        $payMethods = $this->payMethodService->getActiveAccounts();

        if ($payMethods->isEmpty()) {
            return $this->error(
                'No hay métodos de pago activos disponibles.',
                null,
                404
            );
        }

        return $this->success(
            'Métodos de pago activos recuperados con éxito.',
            $payMethods
        );
    }
}
