<?php

namespace App\Http\Api\v1\Services\Cart;

use App\Models\Customers\Cart;
use App\Models\Customers\CartItem;
use App\Models\Products\ProductPack;
use App\Models\Products\ProductVariant;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CartService
{
    public function getCustomerCart(string $customerId): Cart
    {
        $cart = Cart::firstOrCreate(['customer_id' => $customerId]);

        return $this->loadCart($cart);
    }

    public function addItem(string $customerId, string $itemId, string $type, int $quantity = 1): Cart
    {
        return DB::transaction(function () use ($customerId, $itemId, $type, $quantity) {
            $cart = Cart::firstOrCreate(['customer_id' => $customerId]);

            [$modelClass, $item] = $this->resolveItem($itemId, $type);
            $this->ensureIsPurchasable($item, $type);

            $cartItem = CartItem::where([
                'cart_id'   => $cart->id,
                'item_id'   => $item->id,
                'item_type' => $modelClass,
            ])->first();

            $newQuantity = (int) ($cartItem?->quantity ?? 0) + $quantity;
            $this->ensureStock($item, $newQuantity);

            $name = $type === 'pack'
                ? $item->name
                : ($item->product?->name ?? $item->name ?? null);

            if ($cartItem) {
                $cartItem->update([
                    'quantity'   => $newQuantity,
                    'currency'   => 'PEN',
                    'unit_price' => (float) $item->active_price,
                    'metadata'   => array_merge($cartItem->metadata ?? [], ['name' => $name]),
                ]);
            } else {
                $cart->items()->create([
                    'item_id'    => $item->id,
                    'item_type'  => $modelClass,
                    'quantity'   => $quantity,
                    'currency'   => 'PEN',
                    'unit_price' => (float) $item->active_price,
                    'metadata'   => ['name' => $name],
                ]);
            }

            return $this->loadCart($cart->fresh());
        });
    }

    public function updateItemQuantity(string $customerId, CartItem $cartItem, int $quantity): Cart
    {
        return DB::transaction(function () use ($customerId, $cartItem, $quantity) {
            $cart = Cart::where('customer_id', $customerId)->firstOrFail();
            $this->ensureCartOwnership($cart, $cartItem);

            $item = $cartItem->item;
            if (!$item) {
                throw new \InvalidArgumentException('El producto del carrito ya no existe.');
            }

            $type = $cartItem->item_type === ProductPack::class ? 'pack' : 'product';
            $this->ensureIsPurchasable($item, $type);
            $this->ensureStock($item, $quantity);

            $cartItem->update([
                'quantity'   => $quantity,
                'currency'   => 'PEN',
                'unit_price' => (float) $item->active_price,
            ]);

            return $this->loadCart($cart->fresh());
        });
    }

    public function removeItem(string $customerId, CartItem $cartItem): Cart
    {
        return DB::transaction(function () use ($customerId, $cartItem) {
            $cart = Cart::where('customer_id', $customerId)->firstOrFail();
            $this->ensureCartOwnership($cart, $cartItem);

            $cartItem->delete();

            return $this->loadCart($cart->fresh());
        });
    }

    public function clear(string $customerId): Cart
    {
        return DB::transaction(function () use ($customerId) {
            $cart = Cart::firstOrCreate(['customer_id' => $customerId]);
            $cart->items()->delete();

            return $this->loadCart($cart->fresh());
        });
    }

    public function count(string $customerId): array
    {
        $cart = Cart::where('customer_id', $customerId)->first();

        if (!$cart) {
            return [
                'items_count'    => 0,
                'total_quantity' => 0,
            ];
        }

        return [
            'items_count'    => (int) $cart->items()->count(),
            'total_quantity' => (int) $cart->items()->sum('quantity'),
        ];
    }

    protected function resolveItem(string $itemId, string $type): array
    {
        $modelClass = $type === 'pack' ? ProductPack::class : ProductVariant::class;
        $item       = $modelClass::query()->find($itemId);

        if (!$item) {
            throw new \InvalidArgumentException('El producto solicitado no existe.');
        }

        return [$modelClass, $item];
    }

    protected function ensureIsPurchasable(object $item, string $type): void
    {
        if ($type === 'pack' && !$item->is_active) {
            throw new \InvalidArgumentException('El pack no está disponible.');
        }

        if ($type === 'product' && !$item->is_active) {
            throw new \InvalidArgumentException('La variante no está disponible.');
        }
    }

    protected function ensureStock(object $item, int $quantity): void
    {
        $stock = (int) ($item->stock ?? 0);

        if ($stock < $quantity) {
            throw new \InvalidArgumentException('Stock insuficiente para la cantidad solicitada.');
        }
    }

    protected function ensureCartOwnership(Cart $cart, CartItem $cartItem): void
    {
        if ((string) $cartItem->cart_id !== (string) $cart->id) {
            throw new \InvalidArgumentException('El item del carrito no pertenece al cliente autenticado.');
        }
    }

    protected function loadCart(Cart $cart): Cart
    {
        $cart->load([
            'items' => fn($query) => $query->orderByDesc('created_at'),
            'items.item' => function (MorphTo $morphTo) {
                $morphTo->morphWith([
                    ProductVariant::class => [
                        'product',
                        'product.recommendedProducts' => function ($q) {
                            $q->active()->with([
                                'mainVariant'           => fn($v) => $v->select('id', 'product_id', 'price', 'promo_price', 'sku', 'is_on_promo'),
                                'mainVariant.mainImage' => fn($i) => $i->select('id', 'mediable_id', 'mediable_type', 'file_path'),
                            ]);
                        },
                        'mainImage',
                        'selections.attributeValue',
                    ],
                    ProductPack::class => [
                        'mainImage',
                    ],
                ]);
            },
        ]);

        $warnings   = [];
        $validItems = collect();

        foreach ($cart->items as $cartItem) {
            $item = $cartItem->item;
            $savedName = $cartItem->metadata['name'] ?? null;

            // Eliminado de BD (migrate o admin)
            if (!$item) {
                $label      = $savedName ? "\"$savedName\"" : 'Un producto';
                $warnings[] = [
                    'code'    => 'deleted',
                    'message' => "$label fue eliminado del catálogo y removido de tu carrito.",
                ];
                $cartItem->delete();
                continue;
            }

            $isPack = $cartItem->item_type === ProductPack::class;
            $name   = $isPack
                ? $item->name
                : ($item->product?->name ?? $savedName ?? 'Producto');

            // Inactivo
            if (!$item->is_active) {
                $warnings[] = [
                    'code'    => 'inactive',
                    'message' => "\"$name\" ya no está disponible y fue eliminado de tu carrito.",
                ];
                $cartItem->delete();
                continue;
            }

            $stock    = (int) ($item->stock ?? 0);
            $quantity = (int) $cartItem->quantity;

            // Sin stock
            if ($stock === 0) {
                $warnings[] = [
                    'code'    => 'out_of_stock',
                    'message' => "\"$name\" está agotado y fue eliminado de tu carrito.",
                ];
                $cartItem->delete();
                continue;
            }

            // Stock insuficiente → ajustar cantidad
            if ($stock < $quantity) {
                $warnings[] = [
                    'code'            => 'insufficient_stock',
                    'message'         => "Solo hay $stock unidad(es) de \"$name\" disponibles. Se ajustó la cantidad en tu carrito.",
                    'available_stock' => $stock,
                ];
                $cartItem->update(['quantity' => $stock]);
                $cartItem->quantity = $stock;
            }

            $validItems->push($cartItem);
        }

        $cart->setRelation('items', $validItems);
        $cart->cart_warnings = $warnings;

        Log::info("CartService: loadCart — {$validItems->count()} items válidos, " . count($warnings) . " warnings.");

        return $cart;
    }
}