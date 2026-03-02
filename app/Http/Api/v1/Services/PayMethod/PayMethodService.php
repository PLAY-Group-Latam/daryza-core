<?php

namespace App\Http\Api\v1\Services\PayMethod;

use App\Models\PaymentMethod;
use Illuminate\Database\Eloquent\Collection;

class PayMethodService
{
    /**
     * Obtiene todos los métodos de pago (cuentas).
     */
    public function getAllPayMethods(): Collection
    {
        return PaymentMethod::all();
    }

    /**
     * Obtiene solo los métodos de pago activos.
     */
    public function getActivePayMethods(): Collection
    {
        return PaymentMethod::where('is_active', true)->get();
    }
}