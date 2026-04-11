<?php

namespace App\Http\Api\v1\Resources\Cart;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CartResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $items = $this->items ?? collect();
        $totalQuantity = (int) $items->sum(fn($item) => (int) $item->quantity);
        $subtotal = (float) $items->sum(function ($item) {
            return (float) $item->quantity * (float) ($item->unit_price ?? 0);
        });

        // 1. IDs en el carrito para excluir de las recomendaciones (evitamos recomendar lo que ya compró)
        $idsInCart = $items->map(fn($i) => 
            $i->item_type === \App\Models\Products\ProductVariant::class ? $i->item->product_id : null
        )->filter()->unique()->toArray();

        // 2. Recolectamos dinámicamente: máximo 2 recomendados por cada ítem del carrito
        $complementary = $items->flatMap(function ($cartItem) {
            if ($cartItem->item_type === \App\Models\Products\ProductVariant::class) {
                return $cartItem->item->product?->recommendedProducts
                    ? $cartItem->item->product->recommendedProducts->take(2) // 👈 Límite por producto
                    : collect();
            }
            return collect();
        })
        ->unique('id') // Si dos productos recomiendan lo mismo, solo sale una vez
        ->filter(fn($product) => !in_array($product->id, $idsInCart)) // No recomendar lo que ya está en el carro
        ->take(10) // 👈 Límite global de seguridad para el carrusel
        ->values();

        return [
            'cart_id'        => $this->id,
            'items_count'    => $items->count(),
            'total_quantity' => $totalQuantity,
            'currency'       => 'PEN',
            'subtotal'       => round($subtotal, 2),
            'items'          => CartItemResource::collection($items),
            
           'complementary_products' => $complementary->map(fn($p) => [
    // Cambiamos el ID del producto por el ID de su variante principal
    'id'         => $p->mainVariant?->id ?? $p->id, 
    'product_id' => $p->id, // Guardamos el ID del padre por si lo necesitas para navegar al detalle
    'name'       => $p->name,
    'slug'       => $p->slug,
    'sku'        => $p->mainVariant?->sku,
    'price'      => [
        'original'    => (float) $p->mainVariant?->price,
        'current'     => (float) ($p->mainVariant?->promo_price ?? $p->mainVariant?->price),
        'is_on_promo' => (bool) $p->mainVariant?->is_on_promo,
    ],
    'main_image' => [
        'file_path' => $p->mainVariant?->mainImage?->file_path ?? $p->mainImage?->file_path,
    ],
]),

            'updated_at' => optional($this->updated_at)?->format('Y-m-d H:i:s'),
        ];
    }
}