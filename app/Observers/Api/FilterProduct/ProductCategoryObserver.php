<?php

namespace App\Observers\Api\FilterProduct;

use App\Models\Products\ProductCategory;
use Illuminate\Support\Facades\Cache;

class ProductCategoryObserver
{
    private function clearCache(): void
    {
        Cache::forget('sidebar_static_data');
    }

    public function created(ProductCategory $category): void { $this->clearCache(); }
    public function updated(ProductCategory $category): void { $this->clearCache(); }
    public function deleted(ProductCategory $category): void { $this->clearCache(); }
    public function restored(ProductCategory $category): void { $this->clearCache(); }
    public function forceDeleted(ProductCategory $category): void { $this->clearCache(); }
}