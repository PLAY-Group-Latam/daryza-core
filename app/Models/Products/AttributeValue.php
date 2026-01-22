<?php

namespace App\Models\Products;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AttributeValue extends Model
{
    use HasFactory;

    protected $table = 'attribute_values'; // opcional, pero deja todo claro

    protected $fillable = [
        'attribute_id',
        'value',
    ];

    protected $casts = [
        'attribute_id' => 'integer',
    ];

    /**
     * Relación con el atributo padre
     * Ej: Color
     */
    public function attribute()
    {
        return $this->belongsTo(Attribute::class);
    }

    /**
     * Variantes de producto que tienen este valor
     * Ej: Variante Roja, Variante Azul
     */
    public function productVariants()
    {
        return $this->belongsToMany(
            ProductVariant::class,
            'product_variant_attribute_values',
            'attribute_value_id',
            'product_variant_id'
        )->withTimestamps();
    }
}
