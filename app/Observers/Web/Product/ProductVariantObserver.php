<?php

namespace App\Observers\Web\Product;

use App\Http\Api\v1\Services\Notifications\NotificationService;
use App\Models\Products\ProductVariant;
use Illuminate\Support\Facades\DB;

class ProductVariantObserver
{
  public function updated(ProductVariant $variant): void
{
    if ($variant->wasChanged('is_on_promo') && $variant->is_on_promo) {
        DB::afterCommit(function () use ($variant) {
            $product = $variant->product;
            if ($product) {
                app(NotificationService::class)
                    ->notifyPromotion($product, $variant->fresh()); 
            }
        });
    }
}
}