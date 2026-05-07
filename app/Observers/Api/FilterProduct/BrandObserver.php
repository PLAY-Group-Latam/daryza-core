<?php

namespace App\Observers\Api\FilterProduct;

use App\Models\Products\Brand;
use Illuminate\Support\Facades\Cache;

class BrandObserver
{
    private function clearCache(): void
    {
        Cache::forget('sidebar_static_data');
    }

    public function created(Brand $brand): void
    {
        $this->clearCache();
    }

    public function updated(Brand $brand): void
    {
        $this->clearCache();
    }

    public function deleted(Brand $brand): void
    {
        $this->clearCache();
    }

    public function restored(Brand $brand): void
    {
        $this->clearCache();
    }

    public function forceDeleted(Brand $brand): void
    {
        $this->clearCache();
    }
}