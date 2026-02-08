<?php

namespace App\Http\Api\v1\Controllers\Leads;

use App\Http\Api\v1\Controllers\Controller;
use App\Http\Api\v1\Requests\Leads\ContactRequest;
use App\Http\Api\v1\Services\Leads\ContactService;
use App\Http\Api\Traits\ApiTrait;
use Illuminate\Http\JsonResponse;

class ContactApiController extends Controller
{
    use ApiTrait;

    protected ContactService $contactService;

    public function __construct(ContactService $contactService)
    {
        $this->contactService = $contactService;
    }

    /**
     * Store a new contact lead based on type.
     */
    public function store(ContactRequest $request): JsonResponse
    {
        try {
            $lead = $this->contactService->save($request->validated());

            return $this->success(
                '¡Gracias! Tu solicitud ha sido recibida correctamente.',
                $lead,
                201
            );
        } catch (\Exception $e) {
            return $this->error(
                'Hubo un error al procesar tu solicitud.',
                $e->getMessage(),
                500
            );
        }
    }
}