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

    private function wasPromoActiveBefore(ProductVariant $variant): bool
    {
        if (!$variant->getOriginal('is_on_promo') || !$variant->getOriginal('is_active')) {
            return false;
        }

        $promoPrice   = $variant->getOriginal('promo_price');
        $regularPrice = $variant->getOriginal('price');

        $hasValidPrice = !empty($promoPrice)
            && (float) $promoPrice > 0
            && (float) $promoPrice < (float) $regularPrice;

        if (!$hasValidPrice) return false;

        $now = now();

        $startAt = $variant->getOriginal('promo_start_at');
        $endAt   = $variant->getOriginal('promo_end_at');

        $start = $startAt ? \Carbon\Carbon::parse($startAt) : null;
        $end   = $endAt   ? \Carbon\Carbon::parse($endAt)   : null;

        $startOk = is_null($start) || $start->copy()->startOfDay()->lte($now);
        $endOk   = is_null($end)   || $end->copy()->endOfDay()->gte($now);

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

        $promoNowActive    = $this->isPromoActive($variant);
        $wasPromoActiveBefore = $this->wasPromoActiveBefore($variant);

        if (!$promoNowActive && !$wasPromoActiveBefore) {
            return;
        }

        DB::afterCommit(function () use ($variant, $promoNowActive) {
            $product = $variant->product;
            if (!$product) return;

            $service = app(NotificationService::class);

            if ($promoNowActive) {
                $service->notifyPromotion($product, $variant->fresh());
            } else {
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
                    $service->removePromotion($product);
                }
            }
        });
    }
}