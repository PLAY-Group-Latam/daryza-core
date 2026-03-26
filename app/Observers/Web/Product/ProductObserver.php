<?php

namespace App\Observers\Web\Product;

use App\Http\Web\Services\Products\ProductCodeGenerator;
use App\Http\Web\Support\Products\ProductMainVariantNormalizer;
use App\Http\Web\Support\Products\UniqueSlugResolver;
use App\Http\Api\v1\Services\Notifications\NotificationService;
use Illuminate\Support\Facades\DB;
use App\Models\Products\Product;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ProductObserver
{
    public static bool $muteNotifications = false;


    public function creating(Product $product): void
    {
        if (empty($product->code)) {
            $generator = app(ProductCodeGenerator::class);
            $product->code = $generator->generate();
        }
        if (empty($product->slug)) {
            $product->slug = Str::slug($product->name);
        }
    }

   public function created(Product $product): void

{
     if (static::$muteNotifications) return;
    DB::afterCommit(function () use ($product) {
        app(NotificationService::class)->notifyNewProduct($product->fresh());
    });
}

    public function updated(Product $product): void
    {
        app(ProductMainVariantNormalizer::class)->normalize($product);
        
    }

    public function deleting(Product $product): void
    {
        if ($product->isForceDeleting()) {
            Log::warning("Eliminación definitiva de producto: {$product->id}");
            $product->variants()->forceDelete();
            return;
        }

        $product->variants()->delete();

        $product->slug = app(UniqueSlugResolver::class)->resolve(
            Product::class,
            $product->slug . '-deleted-' . now()->timestamp,
            $product->id,
            'producto'
        );
        $product->save();

        Log::info("Producto movido a papelera: {$product->id}");
    }

    public function restoring(Product $product): void
    {
        $product->variants()->restore();
        $product->slug = app(UniqueSlugResolver::class)->resolve(
            Product::class,
            Str::slug($product->name),
            $product->id,
            'producto'
        );

        Log::info("Producto restaurado de papelera: {$product->id}");
    }
}