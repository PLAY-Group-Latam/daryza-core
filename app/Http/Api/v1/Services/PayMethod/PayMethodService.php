<?php

namespace App\Http\Api\v1\Services\PayMethod;

use App\Models\PaymentMethod;
use Illuminate\Database\Eloquent\Collection;

class PayMethodService
{
    public function getActiveAccounts()
    {
        return PaymentMethod::where('is_active', true)->get();
    }
}