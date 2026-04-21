<?php

namespace App\Http\Api\v1\Services\Notifications;

use App\Models\Customers\Notification;
use App\Models\Customers\NotificationRead;
use App\Models\Products\Product;
use App\Models\Products\ProductPack;
use App\Models\Products\ProductVariant;
use Illuminate\Support\Collection;

class NotificationService
{
    const DEFAULT_IMAGE = '/images/daryza-default.png';

    private function resolveImage(?string $image): string
    {
        return $image ?? self::DEFAULT_IMAGE;
    }

    private function isPromotionActive($isOnPromo, $startAt, $endAt): bool
    {
        if (!(bool)$isOnPromo) return false;
        if ($startAt && $startAt->isFuture()) return false;
        if ($endAt && $endAt->isPast()) return false;

        return true;
    }

   
    public function getNotifications(?string $customerId, int $perPage = 5): array
    {
        $dismissedIds = [];
        $readMap = collect([]);

        if ($customerId) {
           
            $dismissedIds = NotificationRead::where('customer_id', $customerId)
                ->where('is_deleted', true)
                ->pluck('notification_id')
                ->toArray();

          
            $readMap = NotificationRead::where('customer_id', $customerId)
                ->where('is_deleted', false)
                ->pluck('read_at', 'notification_id');
        }

        $paginator = Notification::query()
            ->when($customerId, fn($q) => $q->whereNotIn('id', $dismissedIds))
            ->orderByDesc('created_at')
            ->paginate($perPage);

        $collection = $paginator->getCollection();

        $data = $collection->map(function (Notification $n) use ($readMap) {
            return [
                'id' => $n->id,
                'data' => array_merge($n->data, [
                    'productImage' => $this->resolveImage($n->data['productImage'] ?? null),
                ]),
                'read_at' => $readMap[$n->id] ?? null,
            ];
        });

     
     $unreadTotal = $customerId
    ? Notification::whereNotIn('id', array_merge(
        $dismissedIds,
        $readMap->keys()->toArray()
    ))->count()
    : Notification::count();// ← guest ve el total real

        return [
            'data'        => $data,
            'total'       => (int) $unreadTotal,
            'currentPage' => $paginator->currentPage(),
            'lastPage'    => $paginator->lastPage(),
        ];
    }

   
    public function markAsRead(string $id, string $customerId): void
    {
        NotificationRead::updateOrCreate(
            [
                'notification_id' => $id,
                'customer_id'     => $customerId,
            ],
            [
                'read_at' => now(),
                'is_deleted' => false 
            ]
        );
    }

  
    public function markAllAsRead(string $customerId): void
    {
        $dismissedIds = NotificationRead::where('customer_id', $customerId)
            ->where('is_deleted', true)
            ->pluck('notification_id');

        $ids = Notification::whereNotIn('id', $dismissedIds)->pluck('id');

        $now = now();

        $rows = $ids->map(fn($id) => [
            'notification_id' => $id,
            'customer_id'     => $customerId,
            'read_at'         => $now,
            'is_deleted'      => false,
        ])->toArray();

        // 🔥 evita N queries
        NotificationRead::upsert(
            $rows,
            ['notification_id', 'customer_id'],
            ['read_at', 'is_deleted']
        );
    }

    public function dismissNotification(string $id, string $customerId): void
    {
        NotificationRead::updateOrCreate(
            [
                'notification_id' => $id,
                'customer_id'     => $customerId,
            ],
            [
                'is_deleted' => true, // 🔥 ahora es "dismiss"
                'read_at'    => now()
            ]
        );
    }


    public function syncNotifications(
        string $customerId,
        array $readIds = [],
        array $dismissedIds = []
    ): void {

        $now = now();

        if (!empty($readIds)) {
            $readRows = collect($readIds)->map(fn($id) => [
                'notification_id' => $id,
                'customer_id'     => $customerId,
                'read_at'         => $now,
                'is_deleted'      => false,
            ])->toArray();

            NotificationRead::upsert(
                $readRows,
                ['notification_id', 'customer_id'],
                ['read_at', 'is_deleted']
            );
        }

        if (!empty($dismissedIds)) {
            $dismissRows = collect($dismissedIds)->map(fn($id) => [
                'notification_id' => $id,
                'customer_id'     => $customerId,
                'read_at'         => $now,
                'is_deleted'      => true,
            ])->toArray();

            NotificationRead::upsert(
                $dismissRows,
                ['notification_id', 'customer_id'],
                ['read_at', 'is_deleted']
            );
        }
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
                'inPromotion'  => $this->isPromotionActive(
                    $variant->is_on_promo,
                    $variant->promo_start_at,
                    $variant->promo_end_at
                ),
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
                'inPromotion'  => $this->isPromotionActive(
                    $pack->is_on_promotion,
                    $pack->promo_start_at,
                    $pack->promo_end_at
                ),
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
                'inPromotion'  => $this->isPromotionActive(
                    $variant->is_on_promo,
                    $variant->promo_start_at,
                    $variant->promo_end_at
                ),
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