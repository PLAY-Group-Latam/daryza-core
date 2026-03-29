<?php

namespace App\Http\Api\v1\Services\Distributors;

use App\Models\Distributors\Distributor;
use App\Models\Distributors\MapPinSetting;
use Illuminate\Support\Collection;

class DistributorService
{
   
    public function getAllForMap(): Collection
    {
        $distributors = $this->getDistributors();
        $mapPinUrl = $this->getGlobalMapPinUrl();

        // Mapeamos la colección para inyectar el pin en cada distribuidor
        return $distributors->map(function ($distributor) use ($mapPinUrl) {
            $distributor->map_pin = $mapPinUrl;
            return $distributor;
        });
    }

    
    private function getDistributors(): Collection
    {
        return Distributor::all();
    }

 
    private function getGlobalMapPinUrl(): ?string
    {
        
        $setting = MapPinSetting::instance();
        
        return $setting->logo_pin ?? null; 
    }
}