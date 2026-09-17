<?php

namespace App\Http\Api\v1\Resources\Cart;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RecommendProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $variant = $this->mainVariant;

        $originalPrice = (float) ($variant?->price ?? $this->price ?? 0);
        $promoPrice    = (float) ($variant?->promo_price ?? 0);
        $isOnPromo     = (bool)  ($variant?->is_on_promo ?? false);

        $isPromoActive = $isOnPromo
            && $promoPrice > 0
            && (!$variant?->promo_start_at || $variant->promo_start_at->isPast())
            && (!$variant?->promo_end_at || $variant->promo_end_at->isFuture());

        return [
            'id'         => $variant?->id,
            'product_id' => $this->id,

            'name' => $this->name,
            'slug' => $this->slug,
            'sku'  => $variant?->sku,

            'price' => [
                'original'    => $originalPrice,
                'current'     => $isPromoActive ? $promoPrice : $originalPrice,
                'is_on_promo' => $isPromoActive,
            ],

            'main_image' => [
                'file_path' => $variant?->mainImage?->file_path
                              ?? $this->mainImage?->file_path
                              ?? null,
            ],

            'has_variant' => $variant !== null,
        ];
    }
}