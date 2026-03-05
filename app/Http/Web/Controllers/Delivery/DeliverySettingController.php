<?php

namespace App\Http\Web\Controllers\Delivery;

use App\Http\Web\Controllers\Controller;
use App\Models\DeliverySetting;
use App\Http\Web\Services\Delivery\DeliveryService;
use Illuminate\Http\Request;

class DeliverySettingController extends Controller
{
    private $deliveryService;

    public function __construct(DeliveryService $deliveryService)
    {
        $this->deliveryService = $deliveryService;
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'minimum_order_amount'   => 'required|numeric|min:0',
            'order_amount_threshold' => 'required|numeric|min:0',
        ]);

        try {
            $this->deliveryService->updateSettings($data);
            return redirect()->route("delivery-zones.index")->with('success', 'Configuración guardada correctamente');
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['minimum_order_amount' => $e->getMessage()])->withInput();
        }
    }
}

