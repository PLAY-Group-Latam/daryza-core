<?php

namespace App\Models\Distributors;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\SoftDeletes; // <-- 1. Importamos el Soft Delete

class Distributor extends Model
{
    use SoftDeletes; // <-- 2. Usamos el trait de Soft Delete

    protected $fillable = [
        'name',
        'region',
        'ruc',
        'address',
        'email',
        'phone',
        'note',
        'establishment_img',
        'lat',
        'lng',
        'is_active', // <-- 3. Agregamos el campo activo al fillable
    ];

    protected $appends = ['coords'];

    protected $hidden = ['lat', 'lng'];

    /**
     * Definimos los casts del modelo.
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean', // <-- 4. Forzamos a que sea true/false puro
        ];
    }

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