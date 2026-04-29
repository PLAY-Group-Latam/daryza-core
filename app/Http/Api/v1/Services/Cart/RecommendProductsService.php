<?php

namespace App\Http\Api\v1\Services\Cart;

use App\Models\Products\Product;
use App\Models\Products\ProductVariant;
use Illuminate\Support\Collection;

class RecommendProductsService
{
    public function get(array $ids = []): Collection
    {
        if (empty($ids)) {
            return collect();
        }
        
        $productIdsFromVariants = ProductVariant::whereIn('id', $ids)
            ->pluck('product_id');

        $productIds = collect($ids)
            ->merge($productIdsFromVariants)
            ->unique()
            ->values()
            ->toArray();

        if (empty($productIds)) {
            return collect();
        }

        $products = Product::query()
            ->withoutGlobalScopes()
            ->whereIn('id', $productIds)
            ->with([
                'recommendedProducts' => function ($q) {
                    $q->active() 
                        ->with([
                            'mainVariant' => fn($v) => $v->select(
                                'id',
                                'product_id',
                                'price',
                                'promo_price',
                                'sku',
                                'is_on_promo'
                            ),
                            'mainVariant.mainImage' => fn($i) => $i->select(
                                'id',
                                'mediable_id',
                                'mediable_type',
                                'file_path'
                            ),
                        ]);
                }
            ])
            ->get();
        $seen = collect();

        return $products
            ->flatMap(function ($product) use ($productIds, $seen) {

                return collect($product->recommendedProducts)
                   
                    ->reject(fn($rec) => in_array($rec->id, $productIds))
                    ->reject(function ($rec) use ($seen) {
                        if ($seen->contains($rec->id)) {
                            return true;
                        }
                        $seen->push($rec->id);
                        return false;
                    })
                    ->take(2);
            })
            ->values();
    }
}