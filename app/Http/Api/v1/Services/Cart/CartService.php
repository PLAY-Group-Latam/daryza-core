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

            $currentQty = (int) ($cartItem?->quantity ?? 0);
            $requestedTotal = $currentQty + $quantity;

            $stock = (int) ($item->stock ?? 0);

            if ($stock === 0) {
                throw new \InvalidArgumentException('El producto está agotado.');
            }

            // FIX: ya NO clampeamos acá. Guardamos la cantidad solicitada tal cual.
            // loadCart() (que corre al final de este método) es la única fuente de verdad
            // para detectar exceso de stock, clampear y generar el warning `insufficient_stock`.
            // Antes: $finalQuantity = min($requestedTotal, $stock);  <-- esto "borraba" el
            // conflicto antes de que loadCart() pudiera verlo, por eso nunca disparaba el toast.
            $finalQuantity = $requestedTotal;

            $name = $type === 'pack'
                ? $item->name
                : ($item->product?->name ?? $item->name ?? null);

            if ($cartItem) {
                $cartItem->update([
                    'quantity'   => $finalQuantity,
                    'currency'   => 'PEN',
                    'unit_price' => (float) $item->active_price,
                    'metadata'   => array_merge($cartItem->metadata ?? [], ['name' => $name]),
                ]);
            } else {
                $cart->items()->create([
                    'item_id'    => $item->id,
                    'item_type'  => $modelClass,
                    'quantity'   => $finalQuantity,
                    'currency'   => 'PEN',
                    'unit_price' => (float) $item->active_price,
                    'metadata'   => ['name' => $name],
                ]);
            }

            // loadCart() detecta si $finalQuantity > stock, clampea en BD y
            // arma cart_warnings con code: insufficient_stock + available_stock.
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
            // Ya no lanza excepción aquí para evitar romper el flujo de merge,
            // el control de límite se hace directamente en addItem y loadCart.
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

            if (!$item) {
                $label      = $savedName ? "\"$savedName\"" : 'Un producto';
                $warnings[] = [
                    'code'         => 'deleted',
                    'product_name' => $savedName ?? 'Un producto',
                    'message'      => "$label fue eliminado del catálogo y removido de tu carrito.",
                ];
                $cartItem->delete();
                continue;
            }

            $isPack = $cartItem->item_type === ProductPack::class;
            $name   = $isPack
                ? $item->name
                : ($item->product?->name ?? $savedName ?? 'Producto');

            if (!$item->is_active) {
                $warnings[] = [
                    'code'         => 'inactive',
                    'product_name' => $name,
                    'message'      => "\"$name\" ya no está disponible y fue eliminado de tu carrito.",
                ];
                $cartItem->delete();
                continue;
            }

            $stock    = (int) ($item->stock ?? 0);
            $quantity = (int) $cartItem->quantity;

            if ($stock === 0) {
                $warnings[] = [
                    'code'         => 'out_of_stock',
                    'product_name' => $name,
                    'message'      => "\"$name\" está agotado y fue eliminado de tu carrito.",
                ];
                $cartItem->delete();
                continue;
            }

            if ($stock < $quantity) {
                $warnings[] = [
                    'code'            => 'insufficient_stock',
                    'product_name'    => $name,
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