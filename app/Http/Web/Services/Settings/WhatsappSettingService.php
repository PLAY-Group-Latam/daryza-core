<?php

namespace App\Http\Web\Services\Settings;

use App\Http\Web\Services\GcsService;
use App\Models\Settings\WhatsappSetting;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;

class WhatsappSettingService
{
    public function __construct(protected GcsService $gcsService) {}

    public function get(): WhatsappSetting
    {
        return WhatsappSetting::instance();
    }

    public function update(array $data): WhatsappSetting
    {
        $setting = WhatsappSetting::instance();

        $payload = [
            'phone' => '+51' . Arr::get($data, 'phone'),
            'welcome_message' => Arr::get($data, 'welcome_message'),
        ];

        if (($data['icon'] ?? null) instanceof UploadedFile) {
            if ((string) $setting->icon_url !== '') {
                $this->gcsService->deleteFromPublicUrl((string) $setting->icon_url);
            }

            $payload['icon_url'] = $this->gcsService->uploadFile(
                $data['icon'],
                'settings/whatsapp'
            );
        }

        $setting->update($payload);

        return $setting->refresh();
    }
}
