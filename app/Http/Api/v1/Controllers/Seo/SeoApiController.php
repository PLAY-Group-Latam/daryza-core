<?php

namespace App\Http\Api\v1\Controllers\Seo;

use App\Http\Api\v1\Controllers\Controller;
use App\Http\Api\v1\Services\Seo\SeoService;
use App\Http\Api\Traits\ApiTrait;
use Illuminate\Http\JsonResponse;

class SeoApiController extends Controller
{
    use ApiTrait;

    protected $seoService;

    public function __construct(SeoService $seoService)
    {
        $this->seoService = $seoService;
    }

    public function showByPage(string $slug): JsonResponse
    {
        $metadata = $this->seoService->getMetadataBySlug($slug);

        if (!$metadata) {
            return $this->error(
                "No se encontró configuración SEO para la página: {$slug}",
                null, 
                404
            );
        }

        return $this->success(
            "Configuración SEO encontrada",
            $metadata
        );
    }
}