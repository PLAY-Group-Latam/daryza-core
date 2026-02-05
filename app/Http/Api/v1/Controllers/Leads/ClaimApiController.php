<?php

namespace App\Http\Api\v1\Controllers\Leads;

use App\Http\Api\v1\Controllers\Controller; 
use App\Http\Api\v1\Requests\Leads\ClaimRequest;
use App\Http\Api\v1\Services\Leads\ClaimService;
use Illuminate\Http\JsonResponse;

class ClaimApiController extends Controller
{
    protected $claimService;

    public function __construct(ClaimService $claimService)
    {
        $this->claimService = $claimService;
    }

    public function store(ClaimRequest $request): JsonResponse
    {
       
        $claim = $this->claimService->save($request->validated());
        return $this->success(
            '¡Tu reclamación ha sido enviada con éxito!',
            $claim,
            201
        );
    }
}