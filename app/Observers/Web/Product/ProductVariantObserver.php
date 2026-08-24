<?php

namespace App\Observers\Web\Product;

use App\Http\Api\v1\Services\Notifications\NotificationService;
use App\Models\Products\ProductVariant;
use Illuminate\Support\Facades\DB;

class ProductVariantObserver
{
    private function isPromoActive(ProductVariant $variant): bool
    {
        if (!$variant->is_on_promo || !$variant->is_active) return false;

        $hasValidPrice = !empty($variant->promo_price)
            && (float) $variant->promo_price > 0
            && (float) $variant->promo_price < (float) $variant->price;

        if (!$hasValidPrice) return false;

        $now = now();

        $startOk = is_null($variant->promo_start_at)
            || $variant->promo_start_at->copy()->startOfDay()->lte($now);

        $endOk = is_null($variant->promo_end_at)
            || $variant->promo_end_at->copy()->endOfDay()->gte($now);

        return $startOk && $endOk;
    }

    public function updated(ProductVariant $variant): void
    {
        $promoRelatedChanged = $variant->wasChanged([
            'is_on_promo',
            'is_active',
            'promo_price',
            'promo_start_at',
            'promo_end_at',
        ]);

        if (!$promoRelatedChanged) return;

        $promoNowActive = $this->isPromoActive($variant);

        // Si antes NO tenía promo y ahora TAMPOCO es una promo activa (ej. la guardaste con fecha vencida), no hacemos nada.
        $wasPromoActiveBefore = $variant->getOriginal('is_on_promo') && $variant->getOriginal('is_active');
        if (!$promoNowActive && !$wasPromoActiveBefore) {
            return;
        }

        DB::afterCommit(function () use ($variant, $promoNowActive) {
            $product = $variant->product;
            if (!$product) return;

            $service = app(NotificationService::class);

            if ($promoNowActive) {
                // Notificar promoción activa
                $service->notifyPromotion($product, $variant->fresh());
            } else {
                // Solo si TENÍA una promo previa activa y ahora se desactivó/venció, verificamos si otras variantes la mantienen
                $stillHasActivePromo = $product->variants()
                    ->where('id', '!=', $variant->id)
                    ->where('is_on_promo', true)
                    ->where('is_active', true)
                    ->whereNotNull('promo_price')
                    ->where('promo_price', '>', 0)
                    ->whereColumn('promo_price', '<', 'price')
                    ->where(fn($q) => $q->whereNull('promo_start_at')->orWhere('promo_start_at', '<=', now()))
                    ->where(fn($q) => $q->whereNull('promo_end_at')->orWhere('promo_end_at', '>=', now()))
                    ->exists();

                if (!$stillHasActivePromo) {
                    // Quita la notificación de promo que ya tenía el producto.
                    $service->removePromotion($product);
                }
            }
        });
    }
}