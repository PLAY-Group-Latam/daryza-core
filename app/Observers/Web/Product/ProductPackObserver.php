<?php

namespace App\Observers\Web\Product;

use App\Http\Api\v1\Services\Notifications\NotificationService;
use App\Http\Web\Support\Products\UniqueSlugResolver;
use App\Models\Products\ProductPack;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductPackObserver
{
    public function creating(ProductPack $pack): void
    {
        if (empty($pack->code)) {
            $pack->code = 'PK-' . date('y') . '-' . strtoupper(Str::random(6));
        }

        if (empty($pack->slug)) {
            $pack->slug = app(UniqueSlugResolver::class)->resolve(
                ProductPack::class,
                Str::slug($pack->name),
                $pack->id,
                'pack'
            );
        }
    }

    public function created(ProductPack $pack): void
    {
        DB::afterCommit(function () use ($pack) {
            $service = app(NotificationService::class);

            // Si se crea e inmediatamente tiene promoción activa, notifica promoción.
            // Si no, notifica como pack nuevo normal.
            if ($pack->is_on_promotion) {
                $service->notifyPackPromotion($pack);
            } else {
                $service->notifyNewPack($pack);
            }
        });
    }

    public function updated(ProductPack $pack): void
    {
        // 1. EVALUAR EL CAMBIO ANTES DEL AFTER COMMIT (wasChanged revisa lo modificado en esta persistencia)
        $promoChanged = $pack->wasChanged('is_on_promotion');
        $isOnPromotion = (bool) $pack->is_on_promotion;

        if ($promoChanged) {
            DB::afterCommit(function () use ($pack, $isOnPromotion) {
                $service = app(NotificationService::class);

                if ($isOnPromotion) {
                    // Se activó la promoción
                    $service->notifyPackPromotion($pack);
                } else {
                    // Se desactivó la promoción -> elimina la notificación de promo
                    $service->removePackPromotion($pack);
                }
            });
        }
    }

    public function deleting(ProductPack $pack): void
    {
        if (!$pack->isForceDeleting()) {
            $pack->slug = app(UniqueSlugResolver::class)->resolve(
                ProductPack::class,
                $pack->slug . '-deleted-' . now()->timestamp,
                $pack->id,
                'pack'
            );
            $pack->save();
        }
    }

    public function restoring(ProductPack $pack): void
    {
        $pack->slug = app(UniqueSlugResolver::class)->resolve(
            ProductPack::class,
            Str::slug($pack->name),
            $pack->id,
            'pack'
        );
    }
}