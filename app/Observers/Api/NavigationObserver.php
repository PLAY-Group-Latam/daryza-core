<?php

namespace App\Observers\Api;

use Illuminate\Support\Facades\Cache;

class NavigationObserver
{
    public function saved($model) { Cache::forget('mega_menu_data'); }
    public function deleted($model) { Cache::forget('mega_menu_data'); }
}