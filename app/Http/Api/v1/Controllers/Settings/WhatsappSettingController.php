<?php

namespace App\Http\Api\v1\Controllers\Settings;

use App\Http\Api\Traits\ApiTrait;
use App\Http\Api\v1\Controllers\Controller;
use App\Http\Api\v1\Services\Settings\WhatsappSettingService;
use Illuminate\Http\JsonResponse;

class WhatsappSettingController extends Controller
{
    use ApiTrait;

    public function __construct(protected WhatsappSettingService $service) {}

    public function show(): JsonResponse
    {
        return $this->success(
            message: 'Configuración de WhatsApp recuperada correctamente.',
            data: $this->service->getPublicConfig()
        );
    }
}
