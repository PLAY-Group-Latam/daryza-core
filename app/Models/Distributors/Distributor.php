<?php

namespace App\Models\Distributors;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Distributor extends Model
{
    protected $fillable = [
        'name',
        'region',
        'ruc',
        'address',
        'email',
        'phone',
        'note',
        'img_info', 
        'lat',
        'lng'
    ];


    protected $appends = ['coords']; 

    protected $hidden = [
        'lat', 
        'lng', 
       
    ];

    protected function coords(): Attribute
    {
        return Attribute::make(
            get: fn () => [
                'lat' => (float) $this->lat,
                'lng' => (float) $this->lng,
            ],
        );
    }

  
}