<?php

namespace App\Observers\Web\Product;

use App\Http\Api\v1\Services\Notifications\NotificationService;
use App\Models\Products\ProductVariant;
use Illuminate\Support\Facades\DB;

class ProductVariantObserver
{
    public function updated(ProductVariant $variant): void
    {
        // 1. Si la bandera de promo no está activa, salir
        if (!$variant->is_on_promo) {
            return;
        }

        $now = now();

        // 2. Validar precios válidos
        $hasValidPrice = !empty($variant->promo_price) 
            && (float) $variant->promo_price > 0 
            && (float) $variant->promo_price < (float) $variant->price;

        // 3. Ajustar horas para inicio y fin de día en la validación
        $hasValidStartDate = is_null($variant->promo_start_at) 
            || $variant->promo_start_at->copy()->startOfDay()->lte($now);

        $hasValidEndDate = is_null($variant->promo_end_at) 
            || $variant->promo_end_at->copy()->endOfDay()->gte($now);

        $isPromoActive = $variant->is_active 
            && $hasValidPrice 
            && $hasValidStartDate 
            && $hasValidEndDate;

        // 4. Si la fecha ya expiró realmente, cancelar
        if (!$isPromoActive) {
            return;
        }

        // 5. Emitir notificación tras confirmar la transacción
        DB::afterCommit(function () use ($variant) {
            $product = $variant->product;
            if ($product) {
                app(NotificationService::class)
                    ->notifyPromotion($product, $variant->fresh());
            }
        });
    }
}