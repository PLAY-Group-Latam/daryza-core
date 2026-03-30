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

        return [
            'cart_id' => $this->id,
            'items_count' => $items->count(),
            'total_quantity' => $totalQuantity,
            'currency' => 'PEN',
            'subtotal' => round($subtotal, 2),
            'items' => CartItemResource::collection($items),
            'updated_at' => optional($this->updated_at)?->format('Y-m-d H:i:s'),
        ];
    }
}

