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
        $item = $this->item; // Aquí llega o una ProductVariant o un ProductPack
        if (!$item) return [];

        $isPack = $this->item_type === ProductPack::class;

        // Lógica de Imagen: Prioridad Variante -> Prioridad Producto Main
        // Lógica de Imagen Corregida
        $imagePath = null;

        if ($isPack) {
            $imagePath = $item->mainImage?->file_path;
        } else {
            // 1. Intentar imagen de la variante específica guardada
            // 2. Si no tiene, intentar la imagen principal del PRODUCTO (no de la otra variante)
            // 3. Si no, fallback a un placeholder o null
            $imagePath = $item->mainImage?->file_path
                ?? $item->product?->mainImage?->file_path // <--- Cambia esto
                ?? $item->product?->mainVariant?->mainImage?->file_path;
        }

        return [
            'wishlist_id' => $this->id,
            'id'          => $isPack ? $item->id : $item->product?->id,
            'name'        => $isPack ? $item->name : $item->product?->name,
            'slug'        => $isPack ? $item->slug : $item->product?->slug,
            'type'        => $isPack ? 'pack' : 'product',

            'main_variant' => [
                'id'             => $item->id,
                'sku'            => $isPack ? 'PACK-' . $item->id : $item->sku,
                'price'          => (float) $item->price,
                'promo_price'    => (float) $item->promo_price,
                'is_on_promo'    => (bool) ($isPack ? $item->is_on_promotion : $item->is_on_promo),
                'active_price'   => (float) $item->active_price,
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
