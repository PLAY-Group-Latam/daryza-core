<?php

namespace App\Observers\Api\Distributors;

use App\Models\Distributors\Distributor;
use Illuminate\Support\Facades\Cache;

class DistributorObserver
{
    public function saved(Distributor $distributor): void
    {
        $this->clearCache($distributor);
    }

    public function deleted(Distributor $distributor): void
    {
        $this->clearCache($distributor);
    }

    public function restored(Distributor $distributor): void
    {
        $this->clearCache($distributor);
    }

    public function forceDeleted(Distributor $distributor): void
    {
        $this->clearCache($distributor);
    }

    private function clearCache(Distributor $distributor): void
    {
        Cache::forget('distributors_map_all');
        Cache::forget("distributor_detail_{$distributor->id}");
    }
}