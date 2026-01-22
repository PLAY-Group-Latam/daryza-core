<?php

namespace App\Models\Products;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProductVariant extends Model
{
    use SoftDeletes, HasUlids, HasFactory;

    protected $table = 'product_variants';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'product_id',
        'sku',
        'price',
        'promo_price',
        'is_on_promo',
        'stock',
    ];

    protected $casts = [
        'is_on_promo' => 'boolean',
        'price' => 'decimal:2',
        'promo_price' => 'decimal:2',
        'stock' => 'integer',
    ];

    /**
     * Producto padre
     */
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    /**
     * Valores de atributos asociados a esta variante
     * Ej: Rojo, XL, 500ml
     */
    public function attributeValues()
    {
        return $this->belongsToMany(
            AttributeValue::class,
            'product_variant_attribute_values',
            'product_variant_id',
            'attribute_value_id'
        )->withTimestamps();
    }

    /**
     * Pivot explícito si quieres trabajar directo con él
     */
    public function variantAttributes()
    {
        return $this->hasMany(ProductVariantAttributeValue::class, 'product_variant_id');
    }

    /**
     * Media específica de la variante
     */
    public function media()
    {
        return $this->morphMany(ProductMedia::class, 'mediable');
    }

    /**
     * Especificaciones técnicas
     */
    public function specifications()
    {
        return $this->morphMany(ProductSpecification::class, 'specifiable');
    }

    /**
     * Scope: variantes en promoción
     */
    public function scopeOnPromo($query)
    {
        return $query->where('is_on_promo', true);
    }

    /**
     * Scope: variantes con stock
     */
    public function scopeInStock($query)
    {
        return $query->where('stock', '>', 0);
    }

    /**
     * Precio activo (promo o normal)
     */
    public function getActivePriceAttribute()
    {
        return $this->is_on_promo && $this->promo_price
            ? $this->promo_price
            : $this->price;
    }
}
