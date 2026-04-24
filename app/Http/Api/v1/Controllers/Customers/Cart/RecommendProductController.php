<?php

namespace App\Http\Api\v1\Controllers\Customers\Cart;

use Illuminate\Http\Request;
use App\Http\Api\v1\Controllers\Controller;
use App\Http\Api\v1\Services\Cart\RecommendProductsService;
use App\Http\Api\v1\Resources\Cart\RecommendProductResource;

class RecommendProductController extends Controller
{
    public function __construct(
        protected RecommendProductsService $service
    ) {}

    public function complementary(Request $request)
    {
        $ids = $request->input('product_ids', []);

        if (!is_array($ids)) {
            $ids = [$ids];
        }

        $ids = collect($ids)
            ->filter()
            ->unique()
            ->values()
            ->all();

        $products = $this->service->get($ids, 'variant');

        return response()->json([
            'complementary_products' => RecommendProductResource::collection($products)
        ]);
    }
}