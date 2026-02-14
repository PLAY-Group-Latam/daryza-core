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
        'sku_supplier',
        'price',
        'promo_price',
        'is_on_promo',
        'stock',
        'promo_start_at', // nuevo
        'promo_end_at',   // nuevo
        'is_main', // ← agregar aquí

    ];

    protected $casts = [
        'is_on_promo' => 'boolean',
        'is_main' => 'boolean', // ← agregar aquí
        'price' => 'decimal:2',
        'promo_price' => 'decimal:2',
        'stock' => 'integer',
        'promo_start_at' => 'datetime', // nuevo
        'promo_end_at' => 'datetime',   // nuevo
    ];

    /**
     * Producto padre
     */
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function selections()
    {
        return $this->hasMany(ProductVariantAttributeValue::class, 'product_variant_id');
    }

    /**
     * RELACIÓN VISUAL (Valores)
     * Se usa para mostrar: $variant->attributes (Ej: Color Rojo, Talla XL)
     */
    public function attributes()
    {
        return $this->belongsToMany(
            AttributesValue::class,
            'product_variant_attribute_values',
            'product_variant_id',
            'attribute_value_id'
        )->withTimestamps();
    }

    // Valores seleccionados de atributos
    public function variantAttributeValues()
    {
        return $this->hasMany(ProductVariantAttributeValue::class, 'product_variant_id');
    }

    /**
     * Valores de atributos asociados a esta variante
     * Ej: Rojo, XL, 500ml
     */
    public function attributeValues()
    {
        return $this->belongsToMany(
            AttributesValue::class,
            'product_variant_attribute_values',
            'product_variant_id',
            'attribute_value_id'
        )

            ->withTimestamps();
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
        $isPromoActive = $this->is_on_promo &&
            (!$this->promo_start_at || $this->promo_start_at->isPast()) &&
            (!$this->promo_end_at || $this->promo_end_at->isFuture());

        return $isPromoActive ? $this->promo_price : $this->price;
    }
}
