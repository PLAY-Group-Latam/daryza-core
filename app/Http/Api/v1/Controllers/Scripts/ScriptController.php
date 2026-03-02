<?php

namespace App\Http\Api\v1\Controllers\Scripts;

use App\Http\Api\v1\Controllers\Controller;
use App\Http\Api\v1\Services\Scripts\ScriptService;
use App\Http\Api\Traits\ApiTrait;
use Illuminate\Http\JsonResponse;

class ScriptController extends Controller
{
    use ApiTrait;

    public function __construct(
        protected ScriptService $service
    ) {}


    public function index(): JsonResponse
    {

        $scripts = $this->service->getActiveScriptsGrouped();
        $data = [
            'head' => $scripts->get('head', []),
            'body' => $scripts->get('body', []),
        ];
        return $this->success(
            message: 'Scripts recuperados exitosamente',
            data: $data
        );
    }
}