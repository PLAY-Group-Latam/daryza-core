<?php

namespace App\Models\Products;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUlids;

class Product extends Model
{
    use SoftDeletes, HasUlids;

    protected $table = 'products';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'code',
        'name',
        'slug',
        'category_id',
        'brief_description',
        'description',
        'is_active',
    ];

    /**
     * Relaciones
     */

    // Categoría del producto
    public function category()
    {
        return $this->belongsTo(ProductCategory::class, 'category_id');
    }

    // Variantes del producto
    public function variants()
    {
        return $this->hasMany(ProductVariant::class, 'product_id');
    }

    // Variante principal (opcional, para mostrar en listado)
    public function defaultVariant()
    {
        return $this->hasOne(ProductVariant::class, 'id', 'default_variant_id');
    }

    // SEO
    public function metadata()
    {
        return $this->hasOne(ProductMetadata::class, 'product_id');
    }

    // Productos recomendados
    public function recommendations()
    {
        return $this->belongsToMany(
            Product::class,
            'product_recommendations',
            'product_id',
            'recommended_product_id'
        )->withTimestamps();
    }

    /**
     * Scopes útiles
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
      public function specifications() {
        return $this->morphMany(ProductSpecification::class, 'specifiable');
    }
}
