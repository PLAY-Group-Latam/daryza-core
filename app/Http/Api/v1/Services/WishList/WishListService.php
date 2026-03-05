<?php

namespace App\Http\Api\v1\Services\WishList;

use App\Models\Customers\Wishlist;
use App\Models\Products\ProductVariant;
use App\Models\Products\ProductPack;

class WishListService
{

    public function toggle(string $customerId, string $itemId, string $type)
    {
        $modelClass = $type === 'pack' ? ProductPack::class : ProductVariant::class;

        $wishlist = Wishlist::where([
            'customer_id' => $customerId,
            'item_id'     => $itemId,
            'item_type'   => $modelClass
        ])->first();

        if ($wishlist) {
            $wishlist->delete();
            return [
                'action' => 'removed',
                'message' => 'Eliminado de tus favoritos.'
            ];
        }

        Wishlist::create([
            'customer_id' => $customerId,
            'item_id'     => $itemId,
            'item_type'   => $modelClass
        ]);

        return [
            'action' => 'added',
            'message' => '¡Guardado en tus favoritos!'
        ];
    }

    public function getCustomerWishlist(string $customerId)
    {
        return Wishlist::where('customer_id', $customerId)
            ->with([
                'customer',
                'item' => function ($query) {
                    $query->morphWith([
                        ProductVariant::class => ['product', 'mainImage'],
                        ProductPack::class => ['mainImage']
                    ]);
                }
            ])
            ->latest()
            ->get()
            ->filter(fn($wishlist) => $wishlist->item !== null);
    }


    public function getCount(string $customerId): int
    {
        return Wishlist::where('customer_id', $customerId)->count();
    }
}
