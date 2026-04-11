<?php

namespace App\Enums\Currency;

enum CurrencyType: string
{
    case SOLES = 'Soles';
    case DOLARES = 'Dólares';
    //case EUROS = 'Euros';
    //case LIBRAS = 'Libras';
    //case YENS = 'Yens';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}