<?php

namespace App\Providers;

use App\Models\Products\Product;
use App\Models\Products\ProductCategory;
use App\Models\Products\ProductPack;
use App\Models\Products\ProductVariant;
use App\Models\Products\DynamicCategory;
use App\Models\Products\BusinessLine;
use App\Models\Products\AttributesValue;
use App\Observers\Web\Product\ProductCategoryObserver;
use App\Observers\Web\Product\ProductObserver;
use App\Observers\Web\Product\ProductPackObserver;
use App\Observers\Web\Product\ProductVariantObserver;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

use App\Observers\Api\FilterProduct\ProductCategoryObserver as ApiProductCategoryObserver;
use App\Observers\Api\FilterProduct\DynamicCategoryObserver;
use App\Observers\Api\FilterProduct\BusinessLineObserver;
use App\Observers\Api\FilterProduct\AttributeValueObserver;
use App\Observers\Api\Products\InventoryLowStockObserver;
use App\Observers\Api\Products\PackLowStockObserver;
use App\Observers\Api\NavigationObserver;

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
        ProductVariant::observe(ProductVariantObserver::class);
        
        // Observers para la API de filtros de productos CACHE
        ProductCategory::observe(ApiProductCategoryObserver::class);
        DynamicCategory::observe(DynamicCategoryObserver::class);
        BusinessLine::observe(BusinessLineObserver::class);
        AttributesValue::observe(AttributeValueObserver::class);
        Product::observe(NavigationObserver::class);
        ProductCategory::observe(NavigationObserver::class);  
        ProductPack::observe(NavigationObserver::class);        
        ProductVariant::observe(NavigationObserver::class);     
        DynamicCategory::observe(NavigationObserver::class);  
        ProductVariant::observe(InventoryLowStockObserver::class);
        ProductPack::observe(PackLowStockObserver::class);  
    }
}
