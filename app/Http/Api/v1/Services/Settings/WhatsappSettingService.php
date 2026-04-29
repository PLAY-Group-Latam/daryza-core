<?php

namespace App\Http\Api\v1\Services\Settings;

use App\Models\Settings\WhatsappSetting;

class WhatsappSettingService
{
    public function getPublicConfig(): array
    {
        $setting = WhatsappSetting::instance();

        return [
            'icon_url' => $setting->icon_url,
            'phone' => $setting->phone,
            'welcome_message' => $setting->welcome_message,
        ];
    }
}
