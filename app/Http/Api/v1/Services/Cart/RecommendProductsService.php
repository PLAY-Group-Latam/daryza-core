<?php

namespace App\Http\Api\v1\Services\Cart;

use App\Models\Products\Product;
use App\Models\Products\ProductVariant;
use Illuminate\Support\Collection;

class RecommendProductsService
{
    private const PER_PRODUCT = 2;

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

        // Candidatos por producto (sin los que ya están en el carrito)
        $candidates = $products->map(
            fn($product) => collect($product->recommendedProducts)
                ->reject(fn($rec) => in_array($rec->id, $productIds))
                ->values()
        );

        // En cuántos productos del carrito aparece cada recomendado
        $popularity = $candidates
            ->flatMap(fn($list) => $list->pluck('id'))
            ->countBy();

        $seen = collect();

        return $candidates
            ->flatMap(function ($mine) use ($popularity, $seen) {
                $picked = $mine
                    ->sortBy(fn($rec) => $popularity[$rec->id]) // exclusivos primero
                    ->reject(fn($rec) => $seen->contains($rec->id))
                    ->take(self::PER_PRODUCT)
                    ->values();

                $seen->push(...$picked->pluck('id')->all());

                return $picked;
            })
            ->values();
    }
}