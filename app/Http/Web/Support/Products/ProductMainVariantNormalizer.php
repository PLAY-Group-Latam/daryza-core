<?php

namespace App\Http\Web\Support\Products;

use App\Models\Products\Product;

class ProductMainVariantNormalizer
{
    /**
     * @param array<int, string> $variantIds
     */
    public function normalize(Product $product, array $variantIds = []): void
    {
        $variantScope = $product->variants();

        if (!empty($variantIds)) {
            $variantScope->whereIn('id', $variantIds);
        }

        $variantsQuery = clone $variantScope;
        $variantIds = $variantsQuery->pluck('id')->all();

        if (empty($variantIds)) {
            return;
        }

        $activeMainId = $product->variants()
            ->whereIn('id', $variantIds)
            ->where('is_active', true)
            ->where('is_main', true)
            ->value('id');

        $mainId = $activeMainId
            ?? $product->variants()
                ->whereIn('id', $variantIds)
                ->where('is_active', true)
                ->orderBy('created_at', 'asc')
                ->orderBy('id', 'asc')
                ->value('id');

        if (!$mainId) {
            $product->variants()->whereIn('id', $variantIds)->update(['is_main' => false]);
            return;
        }

        $product->variants()
            ->whereIn('id', $variantIds)
            ->where('id', '!=', $mainId)
            ->update(['is_main' => false]);

        $product->variants()->where('id', $mainId)->update(['is_main' => true]);
    }
}
