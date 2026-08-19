<?php

namespace App\Observers\Web\Product;

use App\Http\Api\v1\Services\Notifications\NotificationService;
use App\Http\Web\Support\Products\UniqueSlugResolver;
use App\Models\Products\ProductPack;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductPackObserver
{
    /**
     * La promo es válida si is_on_promotion=true
     * y la fecha actual está dentro del rango (o no hay rango).
     */
    private function isPromoActive(ProductPack $pack): bool
    {
        if (!$pack->is_on_promotion) return false;

        $now = now();

        $startOk = !$pack->promo_start_at || $pack->promo_start_at->lte($now);
        $endOk   = !$pack->promo_end_at   || $pack->promo_end_at->gt($now);

        return $startOk && $endOk;
    }

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

            // Si se crea con promo activa y válida en fecha → notif promo
            // Si no → notif pack nuevo
            if ($this->isPromoActive($pack)) {
                $service->notifyPackPromotion($pack);
            } else {
                $service->notifyNewPack($pack);
            }
        });
    }

    public function updated(ProductPack $pack): void
    {
        $promoFlagChanged  = $pack->wasChanged('is_on_promotion');
        $promoStartChanged = $pack->wasChanged('promo_start_at');
        $promoEndChanged   = $pack->wasChanged('promo_end_at');

        // Reaccionar si cambió is_on_promotion o cualquiera de las fechas
        if (!$promoFlagChanged && !$promoStartChanged && !$promoEndChanged) return;

        $promoNowActive = $this->isPromoActive($pack);

        DB::afterCommit(function () use ($pack, $promoNowActive) {
            $service = app(NotificationService::class);

            if ($promoNowActive) {
                // Promo activa y dentro de rango → notif de oferta
                $service->notifyPackPromotion($pack);
            } else {
                // is_on_promotion=false, o fechas fuera de rango → eliminar promo y poner como nuevo
                $service->removePackPromotion($pack);
            }
        });
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