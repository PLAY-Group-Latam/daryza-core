<?php

namespace App\Http\Web\Controllers\Settings;

use App\Http\Web\Controllers\Controller;
use App\Http\Web\Requests\Settings\WhatsappSettingRequest;
use App\Http\Web\Services\Settings\WhatsappSettingService;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class WhatsappSettingController extends Controller
{
    public function __construct(protected WhatsappSettingService $service) {}

    public function index(): Response
    {
        $setting = $this->service->get();

        return Inertia::render('settings/whatsapp', [
            'setting' => [
                'icon_url' => $setting->icon_url,
                'phone' => $setting->phone,
                'welcome_message' => $setting->welcome_message,
            ],
        ]);
    }

    public function store(WhatsappSettingRequest $request): RedirectResponse
    {
        $this->service->update($request->validated());

        return redirect()
            ->route('whatsapp-settings.index')
            ->with('success', 'Configuración de WhatsApp guardada correctamente.');
    }
}
