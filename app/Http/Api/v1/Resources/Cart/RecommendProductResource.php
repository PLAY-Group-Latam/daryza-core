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

        return [
            'id'         => $variant?->id,
            'product_id' => $this->id,

            'name' => $this->name,
            'slug' => $this->slug,
            'sku'  => $variant?->sku,

            'price' => [
                'original'    => $originalPrice,
                'current'     => ($isOnPromo && $promoPrice > 0) ? $promoPrice : $originalPrice,
                'is_on_promo' => $isOnPromo,
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