<?php

namespace App\Http\Api\v1\Services\Notifications;

use App\Models\Customers\Notification;
use App\Models\Customers\NotificationRead;
use App\Models\Products\Product;
use App\Models\Products\ProductPack;
use App\Models\Products\ProductVariant;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    const DEFAULT_IMAGE = '/images/daryza-default.png';

    // TTL del cache Redis para getNotifications
    private const CACHE_TTL = 60; // segundos

    private function cacheKey(string $prefix, ?string $customerId, ?string $visitorId, int $page): string
    {
        $id = $customerId ? "c:{$customerId}" : "v:{$visitorId}";
        return "notifications:{$prefix}:{$id}:p{$page}";
    }

    public function invalidateCache(?string $customerId, ?string $visitorId): void
    {
        // Invalida las primeras 10 páginas (suficiente en práctica)
        for ($p = 1; $p <= 10; $p++) {
            Cache::forget($this->cacheKey('list', $customerId, $visitorId, $p));
        }
    }

    // ─────────────────────────────────────────────────────────────
    // HELPERS PRIVADOS
    // ─────────────────────────────────────────────────────────────

    private function identifierQuery($query, $customerId, ?string $visitorId)
    {
        return $query->where(function ($q) use ($customerId, $visitorId) {
            if ($customerId && $visitorId) {
                $q->where('customer_id', $customerId)
                    ->orWhere('visitor_id', $visitorId);
            } elseif ($customerId) {
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

    private function findRecord(string $notificationId, ?string $customerId, ?string $visitorId): ?NotificationRead
    {
        $query = NotificationRead::where('notification_id', $notificationId);

        if ($customerId) {
            $query->where('customer_id', $customerId);
        } else {
            $query->whereNull('customer_id')
                ->where('visitor_id', $visitorId);
        }

        return $query->first();
    }

    private function upsertNotificationRead(
        string $notificationId,
        ?string $customerId,
        ?string $visitorId,
        array $attributes
    ): void {
        try {
            $record = $this->findRecord($notificationId, $customerId, $visitorId);

            if ($record) {
                $record->update($attributes);
            } else {
                NotificationRead::create(array_merge([
                    'notification_id' => $notificationId,
                    'customer_id'     => $customerId ?: null,
                    'visitor_id'      => $customerId ? null : $visitorId,
                ], $attributes));
            }
        } catch (\Illuminate\Database\QueryException $e) {
            $code = $e->getCode();
            if ($code === '23505' || $code === '23000') {
                $this->findRecord($notificationId, $customerId, $visitorId)
                    ?->update($attributes);
            } else {
                throw $e;
            }
        }
    }

    // ─────────────────────────────────────────────────────────────
    // GET NOTIFICATIONS — con Redis cache
    // ─────────────────────────────────────────────────────────────

    public function getNotifications(?string $customerId, ?string $visitorId, int $perPage = 5, int $page = 1): array
    {
        $cacheKey = $this->cacheKey('list', $customerId, $visitorId, $page);

        // Usa Cache::tags() directo
        return Cache::tags(['notifications'])->remember($cacheKey, self::CACHE_TTL, function () use ($customerId, $visitorId, $perPage, $page) {
            return $this->fetchNotifications($customerId, $visitorId, $perPage, $page);
        });
    }
    public function clearNotificationCache(): void
    {

        Cache::tags(['notifications'])->flush();
    }
    private function fetchNotifications(?string $customerId, ?string $visitorId, int $perPage, int $page): array
    {
        $deletedIds = $this->identifierQuery(
            NotificationRead::where('is_deleted', true),
            $customerId,
            $visitorId
        )->pluck('notification_id')->toArray();

        $readMap = $this->identifierQuery(
            NotificationRead::where('is_deleted', false)->whereNotNull('read_at'),
            $customerId,
            $visitorId
        )->pluck('read_at', 'notification_id');

        $paginator = Notification::whereNotIn('id', $deletedIds)
            ->orderByDesc('created_at')
            ->paginate($perPage, ['*'], 'page', $page);

        $notifications = $paginator->getCollection();

        $productIds = $notifications
            ->whereIn('type', ['new_product', 'product_promotion'])
            ->pluck('data.product_id')
            ->filter()
            ->unique()
            ->values();

        $packIds = $notifications
            ->whereIn('type', ['new_pack', 'pack_promotion'])
            ->pluck('data.product_id')
            ->filter()
            ->unique()
            ->values();

        $products = Product::with(['variants.mainImage'])
            ->whereIn('id', $productIds)
            ->get()
            ->keyBy('id');

        $packs = ProductPack::with('mainImage')
            ->whereIn('id', $packIds)
            ->get()
            ->keyBy('id');

        $data = $notifications->map(function (Notification $n) use ($readMap, $products, $packs) {
            $data = $n->data ?? [];

            // 👈 SOBREESCRIBIR CON LOS VALORES REALES DE LA TABLA NOTIFICATIONS
            $data['type']    = $n->type;
            $data['title']   = $n->title;
            $data['message'] = $n->message;

            // CASOS 1 Y 2: Producto (Nuevo o Promoción)
            if (in_array($n->type, ['new_product', 'product_promotion'])) {
                $product = $products[$data['product_id'] ?? null] ?? null;

                if ($product) {
                    $variant = $product->variants
                        ->where('is_main', true)
                        ->where('is_active', true)
                        ->first()
                        ?? $product->variants->where('is_active', true)->first();

                    $data['productName']  = $product->name;
                    $data['productImage'] = $this->resolveImage($variant?->mainImage?->file_path ?? null);
                    $data['url']          = $product->slug;
                    $data['inPromotion']  = $n->type === 'product_promotion';
                } else {
                    $data['productName']  = 'Producto no disponible';
                    $data['productImage'] = $this->resolveImage(null);
                    $data['url']          = null;
                    $data['inPromotion']  = false;
                }
            }

            // CASOS 3 Y 4: Pack (Nuevo o Promoción)
            if (in_array($n->type, ['new_pack', 'pack_promotion'])) {
                $pack = $packs[$data['product_id'] ?? null] ?? null;

                if ($pack) {
                    $data['productName']  = $pack->name;
                    $data['productImage'] = $this->resolveImage($pack->mainImage?->file_path ?? null);
                    $data['url']          = $pack->slug;
                    $data['inPromotion']  = $n->type === 'pack_promotion';
                } else {
                    $data['productName']  = 'Pack no disponible';
                    $data['productImage'] = $this->resolveImage(null);
                    $data['url']          = null;
                    $data['inPromotion']  = false;
                }
            }

            return [
                'id'      => $n->id,
                'type'    => $n->type,
                'data'    => $data,
                'read_at' => $readMap[$n->id] ?? null,
            ];
        });

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
    // ─────────────────────────────────────────────────────────────
    // MARK AS READ
    // ─────────────────────────────────────────────────────────────

    public function markAsRead(string $id, ?string $customerId, ?string $visitorId): void
    {
        $this->upsertNotificationRead($id, $customerId, $visitorId, [
            'read_at'    => now(),
            'is_deleted' => false,
        ]);
        $this->invalidateCache($customerId, $visitorId);
    }

    // ─────────────────────────────────────────────────────────────
    // MARK ALL AS READ
    // ─────────────────────────────────────────────────────────────

    public function markAllAsRead(?string $customerId, ?string $visitorId): void
    {
        $existingIds = $this->identifierQuery(
            NotificationRead::query(),
            $customerId,
            $visitorId
        )->pluck('notification_id')->toArray();

        if (!empty($existingIds)) {
            $this->identifierQuery(
                NotificationRead::whereIn('notification_id', $existingIds),
                $customerId,
                $visitorId
            )->update([
                'read_at'    => now(),
                'is_deleted' => false,
            ]);
        }

        $allIds     = Notification::pluck('id')->toArray();
        $missingIds = array_diff($allIds, $existingIds);

        if (!empty($missingIds)) {
            $now  = now();
            $rows = array_map(fn($nId) => [
                'notification_id' => $nId,
                'customer_id'     => $customerId ?: null,
                'visitor_id'      => $customerId ? null : $visitorId,
                'read_at'         => $now,
                'is_deleted'      => false,
                'created_at'      => $now,
                'updated_at'      => $now,
            ], $missingIds);

            foreach (array_chunk($rows, 200) as $chunk) {
                NotificationRead::insert($chunk);
            }
        }

        $this->invalidateCache($customerId, $visitorId);
    }

    // ─────────────────────────────────────────────────────────────
    // DELETE NOTIFICATION
    // ─────────────────────────────────────────────────────────────

    public function deleteNotification(string $id, ?string $customerId, ?string $visitorId): void
    {
        $this->upsertNotificationRead($id, $customerId, $visitorId, [
            'is_deleted' => true,
            'read_at'    => now(),
        ]);
        $this->invalidateCache($customerId, $visitorId);
    }

    // ─────────────────────────────────────────────────────────────
    // SYNC VISITOR → CUSTOMER
    // ─────────────────────────────────────────────────────────────

    public function syncVisitorToCustomer(string $customerId, string $visitorId): void
    {
        $visitorRecords = NotificationRead::where('visitor_id', $visitorId)->get();

        foreach ($visitorRecords as $visitorRecord) {
            $customerRecord = NotificationRead::where('notification_id', $visitorRecord->notification_id)
                ->where('customer_id', $customerId)
                ->first();

            if ($customerRecord) {
                $customerRecord->update([
                    'is_deleted' => $customerRecord->is_deleted || $visitorRecord->is_deleted,
                    'read_at'    => $customerRecord->read_at ?? $visitorRecord->read_at,
                ]);
                $visitorRecord->delete();
            } else {
                $visitorRecord->update([
                    'customer_id' => $customerId,
                    'visitor_id'  => null,
                ]);
            }
        }
    }

    // ─────────────────────────────────────────────────────────────
    // NOTIFY — con upsert por tipo+product_id (no duplica)
    // ─────────────────────────────────────────────────────────────

    /**
     * Busca notif existente del mismo tipo para el mismo product_id.
     * Si existe la reutiliza (no duplica), si no la crea.
     */
    private function upsertNotification(string $type, string $title, string $message, array $data): Notification
    {
        $existing = Notification::where('type', $type)
            ->whereJsonContains('data->product_id', $data['product_id'])
            ->first();

        if ($existing) {
            $existing->update([
                'title'   => $title,
                'message' => $message,
                'data'    => $data, // 👈 Se guarda el nuevo array data con message y title correctos
            ]);
            $notification = $existing;
        } else {
            $notification = Notification::create([
                'type'    => $type,
                'title'   => $title,
                'message' => $message,
                'data'    => $data,
            ]);
        }

        Cache::tags(['notifications'])->flush();

        return $notification;
    }

    private function deleteNotificationByTypeAndProduct(string $type, string $productId): void
    {
        Notification::where('type', $type)
            ->whereJsonContains('data->product_id', $productId)
            ->delete();

        // Invalida la caché para eliminar notificaciones antiguas del menú inmediatamente
        Cache::tags(['notifications'])->flush();
    }

    public function notifyNewProduct(Product $product): void
    {
        if (!$product->is_active) return;

        // Evita duplicar si el producto ya tiene una promoción activa
        $hasPromoNotif = Notification::where('type', 'product_promotion')
            ->whereJsonContains('data->product_id', $product->id)
            ->exists();

        if ($hasPromoNotif) return;

        $title = '¡Nuevo producto!';
        $message = 'Haz clic para conocer más.';

        $this->upsertNotification(
            'new_product',
            $title,
            $message,
            [
                'type'        => 'new_product',
                'title'       => $title,
                'message'     => $message,
                'product_id'  => $product->id,
                'productName' => $product->name,
                'timestamp'   => now()->toIso8601String(),
            ]
        );
    }


    public function notifyNewPack(ProductPack $pack): void
    {
        if (!$pack->is_active) return;

        // Evita duplicar si el pack ya tiene una promoción activa
        $hasPromoNotif = Notification::where('type', 'pack_promotion')
            ->whereJsonContains('data->product_id', $pack->id)
            ->exists();

        if ($hasPromoNotif) return;

        $title = '¡Nuevo pack!';
        $message = 'Haz clic para conocer más.';

        $this->upsertNotification(
            'new_pack',
            $title,
            $message,
            [
                'type'        => 'new_pack',
                'title'       => $title,
                'message'     => $message,
                'product_id'  => $pack->id,
                'productName' => $pack->name,
                'timestamp'   => now()->toIso8601String(),
            ]
        );
    }

    public function notifyPromotion(Product $product, ProductVariant $variant): void
    {
        if (!$product->is_active) return;

        // Elimina notificación de nuevo producto previa para ser reemplazada por la oferta
        $this->deleteNotificationByTypeAndProduct('new_product', $product->id);

        $title = '¡Producto en oferta!';
        $message = "Haz clic para conocer más.";

        $this->upsertNotification(
            'product_promotion',
            $title,
            $message,
            [
                'type'        => 'product_promotion',
                'title'       => $title,
                'message'     => $message,
                'product_id'  => $product->id,
                'productName' => $product->name,
                'promoPrice'  => $variant->promo_price,
                'timestamp'   => now()->toIso8601String(),
            ]
        );
    }


    public function removePromotion(Product $product): void
    {
        // 1. Elimina la notificación de promoción activa
        $this->deleteNotificationByTypeAndProduct('product_promotion', $product->id);

        // 2. Vuelve a registrarlo/asegurarlo como nuevo producto
        $this->notifyNewProduct($product);
    }

    public function notifyPackPromotion(ProductPack $pack): void
    {
        if (!$pack->is_active) return;

        // Elimina notificación de nuevo pack previa para ser reemplazada por la oferta
        $this->deleteNotificationByTypeAndProduct('new_pack', $pack->id);

        $title = '¡Pack en oferta!';
        $message = "Haz clic para conocer más.";

        $this->upsertNotification(
            'pack_promotion',
            $title,
            $message,
            [
                'type'        => 'pack_promotion',
                'title'       => $title,
                'message'     => $message,
                'product_id'  => $pack->id,
                'productName' => $pack->name,
                'promoPrice'  => $pack->promo_price,
                'timestamp'   => now()->toIso8601String(),
            ]
        );
    }

    public function removePackPromotion(ProductPack $pack): void
    {
        // 1. Elimina la notificación de promoción del pack
        $this->deleteNotificationByTypeAndProduct('pack_promotion', $pack->id);

        // 2. Vuelve a registrarlo/asegurarlo como nuevo pack
        $this->notifyNewPack($pack);
    }

    public function notifyOrderCreated($order): void
    {
        Notification::create([
            'type'    => 'order',
            'title'   => 'Nuevo pedido realizado',
            'message' => "Pedido #{$order->id} realizado.",
            'data'    => [
                'type'      => 'order',
                'order_id'  => $order->id,
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }
}
