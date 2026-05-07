<?php

namespace App\Models\Products;

use App\Models\Metadata;
use Illuminate\Database\Eloquent\Model;
use App\Http\Api\Traits\HasSeo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Product extends Model
{
    use SoftDeletes, HasUlids, HasSeo;

    protected $table = 'products';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'code',
        'name',
        'slug',
        'brief_description',
        'description',
        'is_active',
        'is_home',
        'brand_id',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_home' => 'boolean', // ✅ Agregado aquí
    ];

    /**
     * Relaciones
     */

    // Categoría

    public function categories()
    {
        return $this->belongsToMany(ProductCategory::class, 'product_category', 'product_id', 'category_id')
            ->withTimestamps();
    }

    /**
     * Relación con las líneas de negocio (Muchos a Muchos).
     */
    public function businessLines(): BelongsToMany
    {
        return $this->belongsToMany(
            BusinessLine::class,
            'product_business_line',
            'product_id',
            'business_line_id'
        )->using(ProductBusinessLinePivot::class)->withTimestamps();
    }

    // Variantes
    public function variants()
    {
        return $this->hasMany(ProductVariant::class, 'product_id');
    }
    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function dynamicCategories(): BelongsToMany
    {
        return $this->belongsToMany(
            DynamicCategory::class,
            'dynamic_category_items',  // tabla pivot
            'product_id',
            'dynamic_category_id'
        )->withTimestamps();
    }

    public function mainVariant()
    {
        // En E-commerce, esto es sagrado para el rendimiento
        return $this->hasOne(ProductVariant::class)
            ->where('is_main', true)
            ->where('is_active', true);
    }

    // SEO (polimórfico)
    public function metadata()
    {
        return $this->morphOne(Metadata::class, 'metadatable');
    }



    public function technicalSheets()
    {
        return $this->morphMany(ProductMedia::class, 'mediable')
            ->where('type', 'technical_sheet');
    }

    /**
     * Productos recomendados para este producto (cross-sell / related products).
     */
    public function recommendedProducts(): BelongsToMany
    {
        return $this->belongsToMany(
            Product::class,
            'product_recommendations',
            'product_id',
            'recommended_product_id'
        )->withPivot(['position'])->withTimestamps()->orderByPivot('position');
    }

    /**
     * Productos que recomiendan a este producto.
     */
    public function recommendedByProducts(): BelongsToMany
    {
        return $this->belongsToMany(
            Product::class,
            'product_recommendations',
            'recommended_product_id',
            'product_id'
        )->withPivot(['position'])->withTimestamps();
    }


    // public function specifications()
    // {
    //     return $this->hasMany(ProductSpecificationValue::class);
    // }
    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
    public function scopeHome($query)
    {
        return $query->where('is_home', true)->where('is_active', true);
    }
}
