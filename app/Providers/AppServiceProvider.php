<?php

namespace App\Providers;

use App\Models\Products\Product;
use App\Models\Products\ProductCategory;
use App\Models\Products\ProductPack;
use App\Observers\Web\Product\ProductCategoryObserver;
use App\Observers\Web\Product\ProductObserver;
use App\Observers\Web\Product\ProductPackObserver;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (config('app.env') === 'production') {
            URL::forceScheme('https');
        }

        Product::observe(ProductObserver::class);
        ProductPack::observe(ProductPackObserver::class);
        ProductCategory::observe(ProductCategoryObserver::class);
    }
}
