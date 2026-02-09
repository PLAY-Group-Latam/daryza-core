<?php

namespace App\Models\Products;

use App\Models\Metadata;
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

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Relaciones
     */

    // Categoría

    public function categories()
    {
        return $this->belongsToMany(ProductCategory::class, 'product_category', 'product_id', 'category_id')
            ->using(ProductCategoryPivot::class) 
            ->withTimestamps();
    }

    // public function category()
    // {
    //     return $this->belongsTo(ProductCategory::class, 'category_id');
    // }

    // Variantes
    public function variants()
    {
        return $this->hasMany(ProductVariant::class, 'product_id');
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


    public function specifications()
    {
        return $this->hasMany(ProductSpecificationValue::class);
    }
    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
