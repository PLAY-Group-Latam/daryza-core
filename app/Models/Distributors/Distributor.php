<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Storage;

class Distributor extends Model
{
    /**
     * Los atributos que se pueden asignar masivamente.
     */
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

    /**
     * Atributos que deben añadirse al JSON automáticamente.
     */
    protected $appends = ['coords', 'image_url'];

    /**
     * Atributos que deben ocultarse del JSON (para evitar duplicidad).
     */
    protected $hidden = [
        'lat', 
        'lng', 
        'img_info', 
        'created_at', 
        'updated_at'
    ];

    /**
     * Accesor: Crea el objeto 'coords' para cumplir con tu interfaz de React.
     * Resultado: "coords": { "lat": -16.4229, "lng": -71.512 }
     */
    protected function coords(): Attribute
    {
        return Attribute::make(
            get: fn () => [
                'lat' => (float) $this->lat,
                'lng' => (float) $this->lng,
            ],
        );
    }

    /**
     * Accesor: Genera la URL completa desde Google Cloud Storage.
     */
    protected function imageUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->img_info 
                ? Storage::disk('gcs')->url($this->img_info) 
                : null,
        );
    }
}