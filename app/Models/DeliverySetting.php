<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeliverySetting extends Model
{
    /** @use HasFactory<\Database\Factories\DeliverySettingFactory> */
    use HasFactory, HasUlids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = ['minimum_order_amount', 'order_amount_threshold'];

    protected $casts = [
        'minimum_order_amount' => 'float',
        'order_amount_threshold' => 'float',
    ];

    // Devuelve el monto mínimo para delivery
    public static function minimumTotalPrice()
    {
        // Puedes usar first() si solo hay un registro
        return static::first()?->minimum_order_amount ?? 0;
    }

    // Valida si un monto cumple con el mínimo
    public static function meetsMinimum($total)
    {

        return $total >= static::minimumTotalPrice();
    }

    public static function amountToFreeShipping($total)
    {
        $minimum = static::minimumTotalPrice();
        $faltante = $minimum - $total;
        return $faltante > 0 ? $faltante : 0;
    }

    public static function orderAmountThreshold()
    {
        // Puedes usar first() si solo hay un registro
        return static::first()?->order_amount_threshold ?? 0;
    }

    public static function meetsOrderAmountThreshold($total): bool
    {
        $minimum = static::orderAmountThreshold();
        return $total > $minimum;
    }
};

