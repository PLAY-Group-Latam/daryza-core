<?php

namespace App\Http\Api\v1\Controllers\Content;

use App\Http\Api\v1\Controllers\Controller;
use App\Http\Api\v1\Services\Content\ContentService;
use App\Http\Api\v1\Requests\Content\ContentRequest;
use App\Http\Api\Traits\ApiTrait;
use Illuminate\Http\JsonResponse;

class ContentApiController extends Controller
{
    use ApiTrait;

   
    public function __construct(
        protected ContentService $contentService
    ) {}

    
    public function show(ContentRequest $request, string $slug, string $type, int $id): JsonResponse
    {
  
        $result = $this->contentService->getSectionContent($slug, $type, $id);

        
        return response()->json($result);
    }

   
    public function getPage(string $slug): JsonResponse
    {
        $data = $this->contentService->getPageFullContent($slug);

        return response()->json([
            'success' => true,
            'page' => $slug,
            'sections' => $data
        ]);
    }
}