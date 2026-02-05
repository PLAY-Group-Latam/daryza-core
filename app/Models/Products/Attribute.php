<?php

namespace App\Models\Products;

use App\Enums\AttributeType;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Attribute extends Model
{
    use HasFactory, HasUlids;

    protected $table = 'attributes'; // opcional, Laravel lo infiere bien
    protected $keyType = 'string';
    public $incrementing = false;
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
        return $this->hasMany(AttributesValue::class, 'attribute_id');
    }
}
