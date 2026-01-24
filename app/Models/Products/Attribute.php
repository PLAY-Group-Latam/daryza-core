<?php

namespace App\Models\Products;

use App\Enums\AttributeType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Attribute extends Model
{
    use HasFactory;

    protected $table = 'attributes'; // opcional, Laravel lo infiere bien

    protected $fillable = [
        'name',
        'type',
        'is_filterable',
        'is_variant'
    ];

    protected $casts = [
        'is_filterable' => 'boolean',
        'type' => AttributeType::class,

    ];

    /**
     * Valores asociados a este atributo
     * Ej: Color -> Rojo, Azul, Verde
     */
    public function values()
    {
        return $this->hasMany(AttributesValue::class);
    }
}
