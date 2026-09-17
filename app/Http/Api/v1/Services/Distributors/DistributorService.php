<?php

namespace App\Http\Api\v1\Services\Distributors;

use App\Models\Distributors\Distributor;
use App\Models\Distributors\MapPinSetting;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class DistributorService
{
    // 1 día en segundos (24 * 60 * 60 = 86400)
    protected int $cacheTtl = 86400;

    public function getAllForMap(): Collection
    {
        $distributors = Cache::remember('distributors_map_all', $this->cacheTtl, function () {
            return $this->getDistributors();
        });

        $mapPinUrl = $this->getGlobalMapPinUrl();

        return $distributors->map(function ($distributor) use ($mapPinUrl) {
            $distributor->map_pin = $mapPinUrl;
            return $distributor;
        });
    }

    private function getDistributors(): Collection
    {
        return Distributor::query()
            ->where('is_active', true)
            ->get();
    }

    private function getGlobalMapPinUrl(): ?string
    {
        return Cache::remember('map_pin_setting_url', $this->cacheTtl, function () {
            $setting = MapPinSetting::instance();
            return $setting->logo_pin ?? null; 
        });
    }

    public function findById(int $id): Distributor
    {
        return Cache::remember("distributor_detail_{$id}", $this->cacheTtl, function () use ($id) {
            return Distributor::where('is_active', true)->findOrFail($id);
        });
    }
}