<?php

namespace App\Http\Web\Controllers\Delivery;

use App\Http\Web\Controllers\Controller;
use App\Models\DeliverySetting;
use Illuminate\Http\Request;

class DeliverySettingController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'minimum_order_amount' => 'required|numeric|min:0',
            'order_amount_threshold' => 'required|numeric|min:0',
        ]);

        if ($data['minimum_order_amount'] < $data['order_amount_threshold']) {
            return back()->withErrors([
                'minimum_order_amount' => 'El monto mínimo del pedido no puede ser mayor que el umbral del monto del pedido.',
            ])->withInput();
        }

        DeliverySetting::updateOrCreate(
            [],
            $data
        );

        return redirect()->route("delivery-zones.index")->with([
            'type' => 'success',
            'message' => 'Configuración guardada correctamente',
        ]);
    }

}

