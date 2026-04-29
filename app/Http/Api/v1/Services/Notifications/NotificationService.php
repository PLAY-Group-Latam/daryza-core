<?php

namespace App\Http\Api\v1\Services\Notifications;

use App\Models\Customers\Notification;
use App\Models\Customers\NotificationRead;
use App\Models\Products\Product;
use App\Models\Products\ProductPack;
use App\Models\Products\ProductVariant;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    const DEFAULT_IMAGE = '/images/daryza-default.png';

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

    /**
     * Busca el registro existente para esta identidad (customer o visitor).
     * Nunca mezcla ambos — resuelve exactamente UNO.
     */
    private function findRecord(string $notificationId, ?string $customerId, ?string $visitorId): ?NotificationRead
    {
        $query = NotificationRead::where('notification_id', $notificationId);

        if ($customerId) {
            $query->where('customer_id', $customerId);
        } else {
            // Cuando no hay customer, buscar SOLO por visitor_id
            $query->whereNull('customer_id')
                  ->where('visitor_id', $visitorId);
        }

        return $query->first();
    }

    /**
     * Upsert seguro contra race conditions y violaciones UNIQUE.
     * Centraliza toda la lógica de insert/update en un solo lugar.
     */
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
            // Race condition: alguien insertó entre nuestro SELECT y nuestro INSERT
            // Solo se da en concurrencia alta, pero lo manejamos igual
            $code = $e->getCode();
            if ($code === '23505' || $code === '23000') {
                // Reintentar solo el update — el registro ya existe
                $this->findRecord($notificationId, $customerId, $visitorId)
                     ?->update($attributes);
            } else {
                throw $e;
            }
        }
    }

    // ─────────────────────────────────────────────────────────────
    // GET NOTIFICATIONS
    // ─────────────────────────────────────────────────────────────

    public function getNotifications(?string $customerId, ?string $visitorId, int $perPage = 5): array
    {
        // IDs eliminados para este usuario
        $deletedIds = $this->identifierQuery(
            NotificationRead::where('is_deleted', true),
            $customerId,
            $visitorId
        )->pluck('notification_id')->toArray();

        // Mapa read_at por notification_id
        $readMap = $this->identifierQuery(
            NotificationRead::where('is_deleted', false)->whereNotNull('read_at'),
            $customerId,
            $visitorId
        )->pluck('read_at', 'notification_id');

        $paginator = Notification::whereNotIn('id', $deletedIds)
            ->orderByDesc('created_at')
            ->paginate($perPage);

        $notifications = $paginator->getCollection();

        // ── Pre-cargar productos y packs en 2 queries (evita N+1) ──

        $productIds = $notifications
            ->whereIn('type', ['new_product', 'promotion'])
            ->pluck('data.product_id')
            ->filter()
            ->unique()
            ->values();

        $packIds = $notifications
            ->where('type', 'new_pack')
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

        // ── Mapear ──

        $data = $notifications->map(function (Notification $n) use ($readMap, $products, $packs) {

            $data = $n->data;

            // Productos dinámicos (new_product y promotion)
            if (in_array($n->type, ['new_product', 'promotion'])) {

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
                    $data['inPromotion']  = (bool) $variant?->is_on_promo;
                } else {
                    $data['productName']  = 'Producto no disponible';
                    $data['productImage'] = $this->resolveImage(null);
                    $data['url']          = null;
                    $data['inPromotion']  = false;
                }
            }

            // Packs dinámicos
            if ($n->type === 'new_pack') {

                $pack = $packs[$data['product_id'] ?? null] ?? null;

                if ($pack) {
                    $data['productName']  = $pack->name;
                    $data['productImage'] = $this->resolveImage($pack->mainImage?->file_path ?? null);
                    $data['url']          = $pack->slug;
                    $data['inPromotion']  = (bool) $pack->is_on_promotion;
                } else {
                    $data['productName']  = 'Pack no disponible';
                    $data['productImage'] = $this->resolveImage(null);
                    $data['url']          = null;
                    $data['inPromotion']  = false;
                }
            }

            return [
                'id'      => $n->id,
                'data'    => $data,
                'read_at' => $readMap[$n->id] ?? null,
            ];
        });

        // Unread total: notificaciones que no están en readMap ni eliminadas
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
    }

    // ─────────────────────────────────────────────────────────────
    // MARK ALL AS READ  — bulk (3 queries fijas, no loop)
    // ─────────────────────────────────────────────────────────────

    public function markAllAsRead(?string $customerId, ?string $visitorId): void
    {
        // 1. IDs que ya tienen registro para este usuario
        $existingIds = $this->identifierQuery(
            NotificationRead::query(),
            $customerId,
            $visitorId
        )->pluck('notification_id')->toArray();

        // 2. Actualizar los que ya existen en bulk
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

        // 3. Insertar los que no tienen registro aún (bulk insert en chunks)
        $allIds    = Notification::pluck('id')->toArray();
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

            // Chunks de 200 para no explotar el query con miles de rows
            foreach (array_chunk($rows, 200) as $chunk) {
                NotificationRead::insert($chunk);
            }
        }
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
    }

    // ─────────────────────────────────────────────────────────────
    // SYNC VISITOR → CUSTOMER  (llamar al login)
    // ─────────────────────────────────────────────────────────────

    public function syncVisitorToCustomer(string $customerId, string $visitorId): void
    {
        $visitorRecords = NotificationRead::where('visitor_id', $visitorId)->get();

        foreach ($visitorRecords as $visitorRecord) {

            // ¿Ya existe un registro de este customer para esta notificación?
            $customerRecord = NotificationRead::where('notification_id', $visitorRecord->notification_id)
                ->where('customer_id', $customerId)
                ->first();

            if ($customerRecord) {
                // Merge: is_deleted=true gana, read_at más antiguo gana
                $customerRecord->update([
                    'is_deleted' => $customerRecord->is_deleted || $visitorRecord->is_deleted,
                    'read_at'    => $customerRecord->read_at ?? $visitorRecord->read_at,
                ]);
                $visitorRecord->delete();
            } else {
                // Sin conflicto: solo migrar
                $visitorRecord->update([
                    'customer_id' => $customerId,
                    'visitor_id'  => null,
                ]);
            }
        }
    }

    // ─────────────────────────────────────────────────────────────
    // NOTIFICACIONES (sin snapshot)
    // ─────────────────────────────────────────────────────────────

    public function notifyNewProduct(Product $product): void
    {
        if (!$product->is_active) return;

        Notification::create([
            'type'    => 'new_product',
            'title'   => '¡Nuevo producto disponible!',
            'message' => '¡Dale click y entérate más!',
            'data'    => [
                'type'       => 'new_product',
                'product_id' => $product->id,
                'timestamp'  => now()->toIso8601String(),
            ],
        ]);
    }

    public function notifyNewPack(ProductPack $pack): void
    {
        if (!$pack->is_active) return;

        Notification::create([
            'type'    => 'new_pack',
            'title'   => '¡Nuevo pack disponible!',
            'message' => '¡Dale click y entérate más!',
            'data'    => [
                'type'       => 'new_pack',
                'product_id' => $pack->id,
                'timestamp'  => now()->toIso8601String(),
            ],
        ]);
    }

    public function notifyPromotion(Product $product, ?ProductVariant $variant = null): void
    {
        if (!$product->is_active) return;

        Notification::create([
            'type'    => 'promotion',
            'title'   => '¡Producto en promoción!',
            'message' => 'Este producto ahora tiene descuento.',
            'data'    => [
                'type'       => 'promotion',
                'product_id' => $product->id,
                'timestamp'  => now()->toIso8601String(),
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
                'type'      => 'order',
                'order_id'  => $order->id,
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }
}