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

        // No se permiten favoritos de ítems inexistentes.
        if (!$modelClass::query()->whereKey($itemId)->exists()) {
            throw new \InvalidArgumentException('El ítem no existe.');
        }

        $wishlist = Wishlist::where([
            'customer_id' => $customerId,
            'item_id'     => $itemId,
            'item_type'   => $modelClass
        ])->first();

        if ($wishlist) {
            $wishlist->delete();
            return [
                'action'        => 'removed',
                'message'       => 'Eliminado de tus favoritos.',
                'current_count' => $this->getCount($customerId),
            ];
        }

        Wishlist::create([
            'customer_id' => $customerId,
            'item_id'     => $itemId,
            'item_type'   => $modelClass
        ]);

        return [
            'action'        => 'added',
            'message'       => '¡Guardado en tus favoritos!',
            'current_count' => $this->getCount($customerId),
        ];
    }

    public function getCustomerWishlist(string $customerId)
    {
        return Wishlist::where('customer_id', $customerId)
            ->with([
                'customer',
                'item' => function ($query) {
                    $query->morphWith([
                        ProductVariant::class => [
                            'product',
                            'mainImage',
                            'selections',
                            'selections.attributeValue',
                        ],
                        ProductPack::class => ['mainImage']
                    ]);
                }
            ])
            ->latest()
            ->get()
            ->filter(fn($wishlist) => $this->isAvailable($wishlist->item));
    }

    /**
     * Un item está disponible si existe y está publicado.
     * Variante: producto padre activo (y no borrado) + variante activa.
     * Pack: activo.
     */
    private function isAvailable($item): bool
    {
        if ($item === null) {
            return false;
        }

        if ($item instanceof ProductVariant) {
            // $item->product es null si el padre está en papelera (SoftDeletes)
            return $item->product !== null
                && $item->product->is_active
                && $item->is_active;
        }

        return $item->is_active ?? true;
    }

    /**
     * Borra de la wishlist los items cuya variante/pack ya no existe
     * (eliminados o en papelera) y cuenta también los que están
     * no publicados (se ocultan, pero no se borran).
     * Devuelve el total de items no disponibles para el toast.
     */
    public function purgeUnavailable(string $customerId): int
    {
        $wishlists = Wishlist::where('customer_id', $customerId)
            ->with([
                'item' => function ($query) {
                    $query->morphWith([
                        ProductVariant::class => ['product'],
                    ]);
                },
            ])
            ->get();

        $unavailable = 0;

        foreach ($wishlists as $wishlist) {
            if ($wishlist->item === null) {
                $wishlist->delete();
                $unavailable++;
                continue;
            }

            if (!$this->isAvailable($wishlist->item)) {
                $unavailable++;
            }
        }

        return $unavailable;
    }

    public function getCount(string $customerId): int
    {
        return $this->getCustomerWishlist($customerId)->count();
    }
}