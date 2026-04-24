<?php

namespace App\Http\Api\v1\Services\Cart;

use App\Models\Products\Product;
use App\Models\Products\ProductVariant;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class RecommendProductsService
{
    public function get(array $itemIds = [], string $type = 'variant'): Collection
    {
        
        if (empty($itemIds)) {
            return collect();
        }

        $productIds = $this->resolveProductIds($itemIds, $type);

        if (empty($productIds)) {
            return collect();
        }

        $products = Product::query()
            ->withoutGlobalScopes()
            ->whereIn('id', $productIds)
            ->with(['recommendedProducts' => function ($q) {
                $q->active()->with([
                    'mainVariant' => fn($v) => $v->select('id', 'product_id', 'price', 'promo_price', 'sku', 'is_on_promo'),
                    'mainVariant.mainImage' => fn($i) => $i->select('id', 'mediable_id', 'mediable_type', 'file_path'),
                ]);
            }])
            ->get();

       return $products->flatMap(fn($p) => ($p->recommendedProducts ?? collect())->take(2))
    ->unique('id')
    ->reject(fn($product) => in_array($product->id, $productIds))
    ->take(10)
    ->values();
    }

    protected function resolveProductIds(array $ids, string $type): array
    {
        if ($type === 'product') return $ids;
        return ProductVariant::whereIn('id', $ids)
            ->pluck('product_id')
            ->unique()
            ->toArray();
    }
}