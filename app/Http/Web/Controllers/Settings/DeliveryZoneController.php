<?php

namespace App\Http\Web\Controllers\Settings;

use App\Http\Web\Controllers\Controller;
use App\Http\Web\Services\Settings\DeliveryService;
use App\Models\Settings\DeliverySetting;
use App\Models\Settings\DeliveryZone;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DeliveryZoneController extends Controller
{
    private $deliveryService;

    public function __construct(DeliveryService $deliveryService)
    {
        $this->deliveryService = $deliveryService;
    }

    public function index()
    {
        return Inertia::render('delivery/delivery', [
            'departments' => $this->deliveryService->getTreeUbigeos(),
            'settings'    => DeliverySetting::first()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'zone_type'     => 'required|in:department,province,district',
            'zone_id'       => 'required|ulid',
            'is_main'       => 'boolean',
            'delivery_cost' => 'required|numeric|min:0',
        ]);

        try {
            $this->deliveryService->upsertZone($validated);
            return back()->with('success', 'Zona de entrega guardada correctamente');
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['is_main' => $e->getMessage()]);
        }
    }

    public function destroy(DeliveryZone $deliveryZone)
    {
        $deliveryZone->delete();
        return back()->with('success', 'Zona de entrega eliminada correctamente');
    }
}
