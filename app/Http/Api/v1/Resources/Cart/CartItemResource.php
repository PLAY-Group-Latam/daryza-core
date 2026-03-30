<?php

namespace App\Http\Api\v1\Resources\Cart;

use App\Models\Products\ProductPack;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $item = $this->item;
        if (!$item) {
            return [];
        }

        $isPack = $this->item_type === ProductPack::class;

        $imagePath = null;
        if ($isPack) {
            $imagePath = $item->mainImage?->file_path;
        } else {
            $imagePath = $item->mainImage?->file_path
                ?? $item->product?->mainImage?->file_path
                ?? $item->product?->mainVariant?->mainImage?->file_path;
        }

        $variantAttrs = [];
        if (!$isPack && $item->relationLoaded('selections')) {
            $variantAttrs = $item->selections
                ->map(fn($selection) => $selection->attribute_value_id)
                ->filter()
                ->values()
                ->all();
        }

        $quantity = (int) $this->quantity;
        $unitPrice = (float) ($this->unit_price ?? $item->active_price ?? 0);

        return [
            'cart_item_id' => $this->id,
            'id' => $isPack ? $item->id : $item->product?->id,
            'name' => $isPack ? $item->name : $item->product?->name,
            'slug' => $isPack ? $item->slug : $item->product?->slug,
            'type' => $isPack ? 'pack' : 'product',
            'quantity' => $quantity,
            'stock' => (int) ($item->stock ?? 0),
            'currency' => $this->currency ?? 'PEN',
            'unit_price' => $unitPrice,
            'line_total' => round($quantity * $unitPrice, 2),
            'main_variant' => [
                'id' => $item->id,
                'sku' => $isPack ? 'PACK-' . $item->id : $item->sku,
                'price' => (float) $item->price,
                'promo_price' => (float) $item->promo_price,
                'is_on_promo' => (bool) ($isPack ? $item->is_on_promotion : $item->is_on_promo),
                'active_price' => (float) $item->active_price,
                'variant_attrs' => $variantAttrs,
            ],
            'main_image' => [
                'file_path' => $imagePath,
            ],
            'added_at' => optional($this->created_at)?->format('Y-m-d H:i:s'),
        ];
    }
}

