<?php

namespace App\Http\Api\v1\Services\Notifications;

use App\Models\Customers\Notification;
use App\Models\Products\Product;
use App\Models\Products\ProductPack;
use App\Models\Products\ProductSpecification;
use App\Models\Products\ProductPricePerSize;

class NotificationService
{
   public function notifyNewProduct(Product $product): void
{
    $variant = $product->variants()->where('is_main', true)->first()
        ?? $product->variants()->first();

    if (!$variant) return;

    $variant->loadMissing('mainImage');
    $image = $variant->mainImage?->file_path ?? null;

    Notification::create([
        'type'    => 'new_product',
        'title'   => '¡Nuevo producto disponible!',
        'message' => '¡Dale click y entérate más!',
        'data'    => [
            'type'         => 'new_product',
            'title'        => '¡Nuevo producto disponible!',
            'message'      => '¡Dale click y entérate más!',
            'product_id'   => $product->id,
            'productName'  => $product->name,
            'productImage' => $image,
            'timestamp'    => now()->toIso8601String(),
            'url'          => $product->slug,
            'inPromotion'  => (bool) $variant->is_on_promo,
        ],
    ]);
}

   public function notifyNewPack(ProductPack $pack): void
{
    $pack->loadMissing('mainImage');

    Notification::create([
        'type'    => 'new_pack',
        'title'   => '¡Nuevo pack disponible!',
        'message' => '¡Dale click y entérate más!',
        'data'    => [
            'type'         => 'new_pack',
            'title'        => '¡Nuevo pack disponible!',
            'message'      => '¡Dale click y entérate más!',
            'product_id'   => $pack->id,
            'productName'  => $pack->name,
            'productImage' => $pack->mainImage?->file_path ?? null, 
            'timestamp'    => now()->toIso8601String(),
            'url'          => $pack->slug ?? '',
            'inPromotion'  => $pack->is_on_promotion,
        ],
    ]);
}

    public function notifyPromotion(Product $product): void
{
    $variant = $product->variants()->where('is_main', true)->first()
        ?? $product->variants()->first();

    if (!$variant) return;

    $variant->loadMissing('mainImage');

    Notification::create([
        'type'    => 'promotion',
        'title'   => '¡Producto en promoción!',
        'message' => 'Este producto ahora tiene descuento.',
        'data'    => [
            'type'         => 'promotion',
            'title'        => '¡Producto en promoción!',
            'message'      => 'Este producto ahora tiene descuento.',
            'product_id'   => $product->id,
            'productName'  => $product->name,
            'productImage' => $variant->mainImage?->file_path ?? null, 
            'timestamp'    => now()->toIso8601String(),
            'url'          => $product->slug,
            'inPromotion'  => true,
        ],
    ]);
}

    public function notifyOrderCreated($order): void
    {
        Notification::create([
            'type'    => 'order',
            'title'   => 'Nuevo pedido realizado',
            'message' => "Pedido #{$order->id} realizado.",
            'data'    => [
                'type'         => 'order',
                'title'        => 'Nuevo pedido realizado',
                'message'      => "Pedido #{$order->id} realizado.",
                'product_id'   => null,
                'productName'  => null,
                'productImage' => null,
                'timestamp'    => now()->toIso8601String(),
                'url'          => "/orders/{$order->id}",
                'inPromotion'  => false,
            ],
        ]);
    }
}