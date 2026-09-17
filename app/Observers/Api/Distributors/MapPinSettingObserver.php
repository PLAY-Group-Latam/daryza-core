<?php

namespace App\Observers\Api\Distributors;

use App\Models\Distributors\MapPinSetting;
use Illuminate\Support\Facades\Cache;

class MapPinSettingObserver
{
    public function saved(MapPinSetting $mapPinSetting): void
    {
        Cache::forget('map_pin_setting_url');
        Cache::forget('distributors_map_all');
    }
}