<?php

namespace App\Http\Api\v1\Controllers\Sitemap;

use App\Http\Api\v1\Controllers\Controller;
use App\Models\Blogs\Blog;
use App\Models\JobsPortal\Job;
use App\Models\Products\Product;
use App\Models\Products\ProductPack;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class SitemapController extends Controller
{
    public function products(Request $request): JsonResponse
    {
        $paginator = Product::query()
            ->select(['id', 'slug', 'updated_at'])
            ->active()
            ->has('mainVariant')
            ->whereDoesntHave('metadata', fn (Builder $query) => $query->where('noindex', true))
            ->orderBy('id')
            ->paginate($this->perPage($request));

        return $this->paginatedResponse($paginator);
    }

    public function packs(Request $request): JsonResponse
    {
        $paginator = ProductPack::query()
            ->select(['id', 'slug', 'updated_at'])
            ->where('is_active', true)
            ->orderBy('id')
            ->paginate($this->perPage($request));

        return $this->paginatedResponse($paginator);
    }

    public function blogs(Request $request): JsonResponse
    {
        $paginator = Blog::query()
            ->select(['id', 'slug', 'publication_date', 'updated_at'])
            ->where('visibility', true)
            ->whereDoesntHave('metadata', fn (Builder $query) => $query->where('noindex', true))
            ->orderBy('id')
            ->paginate($this->perPage($request));

        return $this->paginatedResponse($paginator);
    }

    public function jobs(Request $request): JsonResponse
    {
        $paginator = Job::query()
            ->select(['id', 'slug', 'updated_at'])
            ->publicVisible()
            ->whereDoesntHave('metadata', fn (Builder $query) => $query->where('noindex', true))
            ->orderBy('id')
            ->paginate($this->perPage($request));

        return $this->paginatedResponse($paginator);
    }

    private function perPage(Request $request): int
    {
        $validated = $request->validate([
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:500'],
        ]);

        return (int) ($validated['per_page'] ?? 500);
    }

    private function paginatedResponse(LengthAwarePaginator $paginator): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'URLs del sitemap listadas correctamente.',
            'data' => [
                'items' => $paginator->items(),
                'meta' => [
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                ],
            ],
        ]);
    }
}
