<?php

namespace App\Http\Api\v1\Services\Notifications;

use App\Models\Customers\Notification;
use App\Models\Customers\NotificationRead;
use App\Models\Products\Product;
use App\Models\Products\ProductPack;
use App\Models\Products\ProductVariant;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class NotificationService
{
    const DEFAULT_IMAGE = '/images/daryza-default.png';
    private const CACHE_TTL = 60;

    private function versionKey(): string
    {
        return 'notifications:version';
    }

    private function currentVersion(): string
    {
        return (string) Cache::rememberForever($this->versionKey(), fn () => (string) Str::uuid());
    }

    private function cacheKey(string $prefix, ?string $customerId, ?string $visitorId, int $perPage, int $page): string
    {
        $id = $customerId ? "c:{$customerId}" : "v:{$visitorId}";
        $version = $this->currentVersion();

        return "notifications:{$version}:{$prefix}:{$id}:pp{$perPage}:p{$page}";
    }

    public function invalidateCache(?string $customerId = null, ?string $visitorId = null): void
    {
        // Invalida todas las entradas cambiando la versión. Es compatible con
        // cualquier driver (incluido `database`, que no soporta Cache::tags()).
        Cache::forever($this->versionKey(), (string) Str::uuid());
    }

    public function clearNotificationCache(): void
    {
        $this->invalidateCache();
    }

    // ─────────────────────────────────────────────────────────────
    // HELPERS PRIVADOS
    // ─────────────────────────────────────────────────────────────

    private function identifierQuery($query, $customerId, ?string $visitorId)
    {
        // Una sola identidad por consulta: nunca se mezclan customer y visitor.
        if ($customerId) {
            return $query->where('customer_id', $customerId);
        }

        if ($visitorId) {
            return $query->whereNull('customer_id')->where('visitor_id', $visitorId);
        }

        // Sin identidad no se debe tocar el estado de nadie.
        return $query->whereRaw('1 = 0');
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
        // Sin identidad no se crea ni modifica estado.
        if (!$customerId && !$visitorId) {
            return;
        }

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
            } elseif ($code === '23503') {
                // La notificación no existe: no hay estado que registrar.
                return;
            } else {
                throw $e;
            }
        }
    }

    /**
     * Primer media (image o video) ordenado por 'order' asc.
     * El que tenga menor order gana, sin importar tipo.
     */
    private function resolveVariantMedia($mediaCollection): array
    {
        $media = $mediaCollection
            ->whereIn('type', ['image', 'video'])
            ->sortBy('order')
            ->first();

        return [
            'file'      => $media?->file_path ?? null,
            'mediaType' => $media?->type ?? null,
        ];
    }

    // ─────────────────────────────────────────────────────────────
    // GET NOTIFICATIONS — con Redis cache
    // ─────────────────────────────────────────────────────────────

    public function getNotifications(?string $customerId, ?string $visitorId, int $perPage = 5, int $page = 1): array
    {
        $cacheKey = $this->cacheKey('list', $customerId, $visitorId, $perPage, $page);

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($customerId, $visitorId, $perPage, $page) {
            return $this->fetchNotifications($customerId, $visitorId, $perPage, $page);
        });
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
            ->filter()->unique()->values();

        $packIds = $notifications
            ->whereIn('type', ['new_pack', 'pack_promotion'])
            ->pluck('data.product_id')
            ->filter()->unique()->values();

        $products = Product::with([
            'variants' => function ($q) {
                $q->where('is_active', true)
                    ->with(['media' => function ($m) {
                        $m->whereIn('type', ['image', 'video'])
                            ->orderBy('order', 'asc');
                    }]);
            },
        ])
            ->whereIn('id', $productIds)
            ->get()
            ->keyBy('id');

        $packs = ProductPack::with(['media' => function ($m) {
            $m->whereIn('type', ['image', 'video'])
                ->orderBy('order', 'asc');
        }])
            ->whereIn('id', $packIds)
            ->get()
            ->keyBy('id');

        $data = $notifications->map(function (Notification $n) use ($readMap, $products, $packs) {
            $data = $n->data ?? [];

            $data['type']    = $n->type;
            $data['title']   = $n->title;
            $data['message'] = $n->message;

            // ── Productos ──
            if (in_array($n->type, ['new_product', 'product_promotion'])) {
                $product = $products[$data['product_id'] ?? null] ?? null;

                if (!$product) {
                    $data['productName']      = 'Producto no disponible';
                    $data['productImage']     = null;
                    $data['productMediaType'] = null;
                    $data['url']              = null;
                    $data['inPromotion']      = false;
                } else {
                    $variant = null;

                    if ($n->type === 'product_promotion') {
                        $variant = isset($data['variant_id'])
                            ? $product->variants->firstWhere('id', $data['variant_id'])
                            : null;

                        $now = now();
                        $variant ??= $product->variants
                            ->filter(function ($v) use ($now) {
                                if (!$v->is_active || !$v->is_on_promo) return false;
                                $hasValidPrice = !empty($v->promo_price)
                                    && (float) $v->promo_price > 0
                                    && (float) $v->promo_price < (float) $v->price;
                                if (!$hasValidPrice) return false;
                                $startOk = is_null($v->promo_start_at) || $v->promo_start_at->lte($now);
                                $endOk   = is_null($v->promo_end_at)   || $v->promo_end_at->gte($now);
                                return $startOk && $endOk;
                            })
                            ->sortByDesc('is_main')  // ← principal primero
                            ->first();
                    }

                    $variant ??= $product->variants->firstWhere('is_main', true)
                        ?? $product->variants->first();

                    $media = $this->resolveVariantMedia($variant?->media ?? collect());

                    $data['productName']      = $product->name;
                    $data['productImage']     = $media['file'];
                    $data['productMediaType'] = $media['mediaType'];
                    $data['url']              = $variant
                        ? $product->slug . '?variant_id=' . $variant->id
                        : $product->slug;
                    $data['inPromotion']      = $n->type === 'product_promotion';
                }
            }

            // ── Packs ──
            if (in_array($n->type, ['new_pack', 'pack_promotion'])) {
                $pack = $packs[$data['product_id'] ?? null] ?? null;

                if ($pack) {
                    $firstMedia = $pack->media
                        ->whereIn('type', ['image', 'video'])
                        ->sortBy('order')
                        ->first();

                    $data['productName']      = $pack->name;
                    $data['productImage']     = $firstMedia?->file_path ?? null;
                    $data['productMediaType'] = $firstMedia?->type ?? null;
                    $data['url']              = $pack->slug;
                    $data['inPromotion']      = $n->type === 'pack_promotion';
                } else {
                    $data['productName']      = 'Pack no disponible';
                    $data['productImage']     = null;
                    $data['productMediaType'] = null;
                    $data['url']              = null;
                    $data['inPromotion']      = false;
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
        // Sin identidad no se crea ni modifica estado.
        if (!$customerId && !$visitorId) {
            return;
        }

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
    // NOTIFY — upsert por tipo+product_id (no duplica)
    // ─────────────────────────────────────────────────────────────

    private function upsertNotification(string $type, string $title, string $message, array $data): Notification
    {
        $existing = Notification::where('type', $type)
            ->whereJsonContains('data->product_id', $data['product_id'])
            ->first();

        if ($existing) {
            $existing->update([
                'title'   => $title,
                'message' => $message,
                'data'    => $data,
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

        $this->invalidateCache();

        return $notification;
    }

    private function deleteNotificationByTypeAndProduct(string $type, string $productId): void
    {
        Notification::where('type', $type)
            ->whereJsonContains('data->product_id', $productId)
            ->delete();

        $this->invalidateCache();
    }

    // ─────────────────────────────────────────────────────────────
    // MÉTODOS PÚBLICOS DE NOTIFICACIÓN
    // ─────────────────────────────────────────────────────────────

    public function notifyNewProduct(Product $product): void
    {
        if (!$product->is_active) return;

        $hasPromoNotif = Notification::where('type', 'product_promotion')
            ->whereJsonContains('data->product_id', $product->id)
            ->exists();

        if ($hasPromoNotif) return;

        $title   = '¡Nuevo producto!';
        $message = 'Haz clic para conocer más.';

        // new_product no lleva variant_id — la PDP abre la variante principal por defecto
        $this->upsertNotification('new_product', $title, $message, [
            'type'        => 'new_product',
            'title'       => $title,
            'message'     => $message,
            'product_id'  => $product->id,
            'productName' => $product->name,
            'timestamp'   => now()->toIso8601String(),
        ]);
    }

    public function notifyNewPack(ProductPack $pack): void
    {
        if (!$pack->is_active) return;

        $hasPromoNotif = Notification::where('type', 'pack_promotion')
            ->whereJsonContains('data->product_id', $pack->id)
            ->exists();

        if ($hasPromoNotif) return;

        $title   = '¡Nuevo pack!';
        $message = 'Haz clic para conocer más.';

        $this->upsertNotification('new_pack', $title, $message, [
            'type'        => 'new_pack',
            'title'       => $title,
            'message'     => $message,
            'product_id'  => $pack->id,
            'productName' => $pack->name,
            'timestamp'   => now()->toIso8601String(),
        ]);
    }

    public function notifyPromotion(Product $product, ProductVariant $variant): void
    {
        if (!$product->is_active) return;

        $this->deleteNotificationByTypeAndProduct('new_product', $product->id);

        $title   = '¡Producto en oferta!';
        $message = 'Haz clic para conocer más.';

        // Guardamos variant_id para que el link lleve directo a esa variante en promo
        $this->upsertNotification('product_promotion', $title, $message, [
            'type'        => 'product_promotion',
            'title'       => $title,
            'message'     => $message,
            'product_id'  => $product->id,
            'variant_id'  => $variant->id,
            'productName' => $product->name,
            'promoPrice'  => $variant->promo_price,
            'timestamp'   => now()->toIso8601String(),
        ]);
    }

    public function removePromotion(Product $product): void
    {
        $this->deleteNotificationByTypeAndProduct('product_promotion', $product->id);
        $this->notifyNewProduct($product);
    }

    public function notifyPackPromotion(ProductPack $pack): void
    {
        if (!$pack->is_active) return;

        $this->deleteNotificationByTypeAndProduct('new_pack', $pack->id);

        $title   = '¡Pack en oferta!';
        $message = 'Haz clic para conocer más.';

        $this->upsertNotification('pack_promotion', $title, $message, [
            'type'        => 'pack_promotion',
            'title'       => $title,
            'message'     => $message,
            'product_id'  => $pack->id,
            'productName' => $pack->name,
            'promoPrice'  => $pack->promo_price,
            'timestamp'   => now()->toIso8601String(),
        ]);
    }

    public function removePackPromotion(ProductPack $pack): void
    {
        $this->deleteNotificationByTypeAndProduct('pack_promotion', $pack->id);
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
