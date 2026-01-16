<?php

namespace App\Http\Web\Controllers\Delivery;

use App\Http\Web\Controllers\Controller;
use App\Http\Web\Services\Delivery\DeliveryService;
use App\Models\DeliverySetting;
use App\Models\DeliveryZone;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DeliveryZoneController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    private $deliveryService;
    public function __construct(DeliveryService $deliveryService)
    {
        $this->deliveryService = $deliveryService;
    }

    public function index()
    {
        $ubigeos = $this->deliveryService->getTreeUbigeos();
        $settings = DeliverySetting::first();

        return Inertia::render('delivery/delivery', [
            'departments' => $ubigeos,
            'settings' => $settings
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'zone_type' => 'required|in:department,province,district',
            'zone_id' => 'required|ulid',
            'is_main' => 'boolean',
            'delivery_cost' => 'required|numeric|min:0',
        ]);

        if (($validated['is_main'] ?? false) && $validated['zone_type'] !== 'district') {
            throw new \Exception('Solo los distritos pueden ser marcados como sede principal');
        }

        if (($validated['is_main'] ?? false) && $validated['zone_type'] === 'district') {
            DeliveryZone::where('zone_type', 'district')->where('is_main', true)->update(['is_main' => false]);
        }

        DeliveryZone::updateOrCreate(
            [
                'zone_type' => $validated['zone_type'],
                'zone_id' => $validated['zone_id'],
            ],
            [
                'delivery_cost' => $validated['delivery_cost'],
                'is_main' => $validated['is_main'] ?? false,
            ]
        );

        return redirect()->refresh()->with([
            'type' => 'success',
            'message' => 'Zona de entrega guardada correctamente',
        ]);
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(DeliveryZone $deliveryZone)
    {
        $deliveryZone->delete();

        return redirect()->route('delivery-zones.index')->with([
            'type' => 'success',
            'message' => 'Zona de entrega eliminada correctamente',
        ]);
    }
}

