<?php


namespace App\Models\Distributors;

use Illuminate\Database\Eloquent\Model;

class MapPinSetting extends Model
{
    protected $fillable = ['logo_pin'];
 
    public static function instance(): static
    {
        return static::firstOrCreate(['id' => 1]);
    }
}
 