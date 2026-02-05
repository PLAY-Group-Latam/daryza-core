<?php

namespace App\Models\Products;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AttributesValue extends Model
{
    use HasFactory, HasUlids;

    protected $table = 'attributes_values'; // ✅ nombre real en DB
    protected $keyType = 'string';
    public $incrementing = false;
    protected $fillable = [
        'attribute_id',
        'value',
    ];



    /**
     * Relación con el atributo padre
     * Ej: Color
     */
    public function attribute()
    {
        return $this->belongsTo(Attribute::class, 'attribute_id');
    }


    /**
     * Variantes de producto que tienen este valor
     * Ej: Variante Roja, Variante Azul
     */
    // public function productVariants()
    // {
    //     return $this->belongsToMany(
    //         ProductVariant::class,
    //         'product_variant_attribute_values',
    //         'attribute_value_id',
    //         'product_variant_id'
    //     )->withTimestamps();
    // }
}
