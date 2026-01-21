<?php

namespace App\Models\Products;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AttributeValue extends Model
{
    use HasFactory;

    protected $fillable = [
        'attribute_id',
        'value',
    ];

    /**
     * Relación con el atributo padre
     */
    public function attribute()
    {
        return $this->belongsTo(Attribute::class);
    }

    /**
     * Variantes de producto que tienen este valor
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
