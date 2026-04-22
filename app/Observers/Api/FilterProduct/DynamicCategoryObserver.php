<?php

namespace App\Observers\Api\FilterProduct;

use App\Models\Products\DynamicCategory;
use Illuminate\Support\Facades\Cache;

class DynamicCategoryObserver
{
    /**
     * Limpia el caché del sidebar para forzar la actualización en la próxima carga.
     */
    private function clearCache(): void
    {
        Cache::forget('sidebar_static_data');
    }

    /**
     * Handle the DynamicCategory "created" event.
     */
    public function created(DynamicCategory $dynamicCategory): void
    {
        $this->clearCache();
    }

    /**
     * Handle the DynamicCategory "updated" event.
     */
    public function updated(DynamicCategory $dynamicCategory): void
    {
        $this->clearCache();
    }

    /**
     * Handle the DynamicCategory "deleted" event.
     */
    public function deleted(DynamicCategory $dynamicCategory): void
    {
        $this->clearCache();
    }

    /**
     * Handle the DynamicCategory "restored" event.
     */
    public function restored(DynamicCategory $dynamicCategory): void
    {
        $this->clearCache();
    }

    /**
     * Handle the DynamicCategory "force deleted" event.
     */
    public function forceDeleted(DynamicCategory $dynamicCategory): void
    {
        $this->clearCache();
    }
}