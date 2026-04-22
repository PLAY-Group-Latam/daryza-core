<?php

namespace App\Observers\Api\FilterProduct;

use App\Models\Products\BusinessLine;
use Illuminate\Support\Facades\Cache;

class BusinessLineObserver
{
    /**
     * Limpia el caché del sidebar.
     */
    private function clearCache(): void
    {
        Cache::forget('sidebar_static_data');
    }

    /**
     * Handle the BusinessLine "created" event.
     */
    public function created(BusinessLine $businessLine): void
    {
        $this->clearCache();
    }

    /**
     * Handle the BusinessLine "updated" event.
     */
    public function updated(BusinessLine $businessLine): void
    {
        $this->clearCache();
    }

    /**
     * Handle the BusinessLine "deleted" event.
     */
    public function deleted(BusinessLine $businessLine): void
    {
        $this->clearCache();
    }

    /**
     * Handle the BusinessLine "restored" event.
     */
    public function restored(BusinessLine $businessLine): void
    {
        $this->clearCache();
    }

    /**
     * Handle the BusinessLine "force deleted" event.
     */
    public function forceDeleted(BusinessLine $businessLine): void
    {
        $this->clearCache();
    }
}