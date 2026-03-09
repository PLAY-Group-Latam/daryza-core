<?php

namespace App\Http\Api\v1\Resources\WishList;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Models\Products\ProductPack;
use Illuminate\Support\Carbon;

class WishlistResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $item = $this->item;
        if (!$item) return [];

        $isPack = $this->item_type === ProductPack::class;

        $imagePath = null;

        if ($isPack) {
            $imagePath = $item->mainImage?->file_path;
        } else {
            $imagePath = $item->mainImage?->file_path
                ?? $item->product?->mainImage?->file_path
                ?? $item->product?->mainVariant?->mainImage?->file_path;
        }

        // ✅ Attribute value IDs para construir la URL correcta en el frontend
        $variantAttrs = [];
        if (!$isPack && $item->relationLoaded('selections')) {
            $variantAttrs = $item->selections
                ->map(fn($s) => $s->attribute_value_id)
                ->filter()
                ->values()
                ->all();
        }

        return [
            'wishlist_id' => $this->id,
            'id'          => $isPack ? $item->id : $item->product?->id,
            'name'        => $isPack ? $item->name : $item->product?->name,
            'slug'        => $isPack ? $item->slug : $item->product?->slug,
            'type'        => $isPack ? 'pack' : 'product',

            'main_variant' => [
                'id'           => $item->id,
                'sku'          => $isPack ? 'PACK-' . $item->id : $item->sku,
                'price'        => (float) $item->price,
                'promo_price'  => (float) $item->promo_price,
                'is_on_promo'  => (bool) ($isPack ? $item->is_on_promotion : $item->is_on_promo),
                'active_price' => (float) $item->active_price,
                'variant_attrs' => $variantAttrs, // ✅ NUEVO
            ],

            'main_image' => [
                'file_path' => $imagePath,
            ],

            'added_at' => $this->formatDate($this->created_at),
        ];
    }

    private function formatDate($date): ?string
    {
        if (!$date) return null;
        return $date instanceof Carbon
            ? $date->format('Y-m-d H:i:s')
            : Carbon::parse($date)->format('Y-m-d H:i:s');
    }
}