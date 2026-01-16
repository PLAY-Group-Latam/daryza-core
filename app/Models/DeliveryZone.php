<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class DeliveryZone extends Model
{
    use HasUlids;
    protected $keyType = 'string';
    public $incrementing = false;
    protected $fillable = [
        'zone_type',
        'zone_id',
        'is_main',
        'delivery_cost',
    ];

    protected $casts = [
        'is_main' => 'boolean',
        'delivery_cost' => 'decimal:2',
    ];

    public function zone()
    {
        return match ($this->zone_type) {
            'department' => $this->belongsTo(Department::class, 'zone_id'),
            'province' => $this->belongsTo(Province::class, 'zone_id'),
            'district' => $this->belongsTo(District::class, 'zone_id'),
            default => null,
        };
    }

    // public function zoneable()
    // {
    //      return $this->morphTo('zoneable', 'zone_type', 'zone_id');
    // }

    // public function getZoneAttribute()
    // {
    //     return match ($this->zone_type) {
    //         'department' => Department::find($this->zone_id),
    //         'province' => Province::find($this->zone_id),
    //         'district' => District::find($this->zone_id),
    //         default => null,
    //     };
    // }
}

