<?php

namespace App\Http\Api\v1\Services\Notifications;

use App\Models\Customers\Notification;
use App\Models\Customers\NotificationRead;
use App\Models\Products\Product;
use App\Models\Products\ProductPack;
use App\Models\Products\ProductVariant;

class NotificationService
{
    const DEFAULT_IMAGE = '/images/daryza-default.png';


   private function identifierQuery($query, $customerId, ?string $visitorId)
    {
        return $query->where(function ($q) use ($customerId, $visitorId) {
            if ($customerId) {
                $q->where('customer_id', $customerId);
            } else {
                $q->where('visitor_id', $visitorId);
            }
        });
    }

    private function resolveImage(?string $image): string
    {
        return $image ?? self::DEFAULT_IMAGE;
    }

   

    public function getNotifications(?string $customerId, ?string $visitorId, int $perPage = 5): array
    {

        $deletedIds = $this->identifierQuery(
            NotificationRead::where('is_deleted', true),
            $customerId,
            $visitorId
        )->pluck('notification_id')->toArray();

  
        $readMap = $this->identifierQuery(
            NotificationRead::where('is_deleted', false),
            $customerId,
            $visitorId
        )->pluck('read_at', 'notification_id');


        $paginator = Notification::whereNotIn('id', $deletedIds)
            ->orderByDesc('created_at')
            ->paginate($perPage);

        $data = $paginator->getCollection()->map(fn(Notification $n) => [
            'id'      => $n->id,
            'data'    => array_merge($n->data, [
                'productImage' => $this->resolveImage($n->data['productImage'] ?? null),
            ]),
            'read_at' => $readMap[$n->id] ?? null,
        ]);


        $unreadTotal = Notification::whereNotIn('id', array_merge(
            $deletedIds,
            $readMap->keys()->toArray()
        ))->count();

        return [
            'data'        => $data,
            'total'       => (int) $unreadTotal,
            'currentPage' => $paginator->currentPage(),
            'lastPage'    => $paginator->lastPage(),
        ];
    }



    public function markAsRead(string $id, ?string $customerId, ?string $visitorId): void
    {
        NotificationRead::updateOrCreate(
            [
                'notification_id' => $id,
                'customer_id'     => $customerId,
                'visitor_id'      => $visitorId,
            ],
            ['read_at' => now(), 'is_deleted' => false]
        );
    }



  public function markAllAsRead(?string $customerId, ?string $visitorId): void
    {
        $deletedIds = $this->identifierQuery(
            NotificationRead::where('is_deleted', true),
            $customerId,
            $visitorId
        )->pluck('notification_id')->toArray();

        $pendingIds = Notification::whereNotIn('id', $deletedIds)->pluck('id');

        foreach ($pendingIds as $notifId) {
            NotificationRead::updateOrCreate(
                [
                    'notification_id' => $notifId,
                    'customer_id'     => $customerId,
                    'visitor_id'      => $visitorId,
                ],
                ['read_at' => now(), 'is_deleted' => false]
            );
        }
    }



   public function deleteNotification(string $id, ?string $customerId, ?string $visitorId): void
    {
        NotificationRead::updateOrCreate(
            [
                'notification_id' => $id,
                'customer_id'     => $customerId,
                'visitor_id'      => $visitorId,
            ],
            ['is_deleted' => true, 'read_at' => now()]
        );
    }



    public function notifyNewProduct(Product $product): void
    {
   
        $variant = $product->variants()
            ->where('is_main', true)
            ->where('is_active', true)
            ->first()
            ?? $product->variants()->where('is_active', true)->first();

        if (!$variant || !$product->is_active) return;

        $variant->loadMissing('mainImage');

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
                'productImage' => $this->resolveImage($variant->mainImage?->file_path ?? null),
                'timestamp'    => now()->toIso8601String(),
                'url'          => $product->slug,
                'inPromotion'  => (bool) $variant->is_on_promo,
            ],
        ]);
    }

    public function notifyNewPack(ProductPack $pack): void
    {
     
        if (!$pack->is_active) return;

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
                'productImage' => $this->resolveImage($pack->mainImage?->file_path ?? null),
                'timestamp'    => now()->toIso8601String(),
                'url'          => $pack->slug ?? '',
                'inPromotion'  => (bool) $pack->is_on_promotion,
            ],
        ]);
    }

    public function notifyPromotion(Product $product, ?ProductVariant $variant = null): void
{
    $variant ??= $product->variants()
        ->where('is_main', true)
        ->where('is_active', true)
        ->first()
        ?? $product->variants()->where('is_active', true)->first();

    if (!$variant || !$product->is_active) return;

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
            'productImage' => $this->resolveImage($variant->mainImage?->file_path ?? null),
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
                'productImage' => $this->resolveImage(null),
                'timestamp'    => now()->toIso8601String(),
                'url'          => "/orders/{$order->id}",
                'inPromotion'  => false,
            ],
        ]);
    }
}
