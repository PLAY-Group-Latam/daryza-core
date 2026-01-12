<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasUlids;
    use SoftDeletes;

    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = [
        'code',
        'name',
        'slug',
        'description',
        'brief_description',
        'main_page',
        'category_id'
    ];
    protected $appends = [
        'default_url',
        'in_promotion'
    ];
    protected ?ProductPromotion $cachedActivePromotion = null;


    public function metadata()
    {
        return $this->hasOne(ProductMetadata::class, 'product_id', 'id');
    }

    public function ratings()
    {
        return $this->hasMany(ProductRating::class, 'product_id');
    }

    public function pricePerSizes()
    {
        return $this->hasMany(ProductPricePerSize::class, 'product_id');
    }
    /**
     * @deprecated
     *
     * @return $this ...please avoid using this
     */
    public function getDefaultUrlAttribute()
    {
        $default_price_per_sizes = $this->pricePerSizes()->where('default', true)->first();
        $default_spec = $default_price_per_sizes?->productSpecification
            ->where('default', true)
            ->first();

        return $this->slug . '?' .
            'color=' . ($default_spec?->color ?? '') . '&' .
            'size=' . ($default_price_per_sizes?->size ?? '');
    }
    public function category()
    {
        return $this->belongsTo(ProductCategory::class, 'category_id');
    }
    public function subCategories()
    {
        return $this->belongsToMany(ProductSubCategory::class, 'join_sub_categories_products', 'product_id', 'sub_category_id');
    }

    public function businessLines()
    {
        return $this->belongsToMany(ProductBusinessLine::class, 'join_business_line_products', 'product_id', 'business_line_id')
            ->using(JoinBusinessLineProducts::class);
    }
    public function wishList()
    {
        return $this->morphMany(Wishlist::class, 'wishable');
    }
    /* public function subCategoriesSortedByProductLine ()
    {
        return $this->belongsToMany(ProductSubCategory::class, 'join_sub_categories_products', 'product_id', 'sub_category_id')
            ->using(JoinSubCategoriesProducts::class, 'product_id')
            ->join('product_categories as category', 'product_sub_categories.category_id', '=', 'category.id')
            ->join('product_lines as product_line', 'category.product_line_id', '=', 'product_line.id')
            ->orderBy('product_line.name')
            ->select('product_sub_categories.*');
    } */
    public function technicalSheets()
    {
        return $this->hasMany(ProductTechnicalSheets::class, 'product_id');
    }
    public function defaultPricePerSize()
    {
        return $this->hasOne(ProductPricePerSize::class, 'product_id')
            ->where('default', true);
    }
    public function pricePerSizesAllSpecs()
    {
        return $this->hasMany(ProductPricePerSize::class, 'product_id');
    }
    public function getAvailableColors()
    {
        return $this->pricePerSizes()
            ->with(['productSpecification' =>
                fn($q) => $q->where('visibility', true)])
            ->get()
            ->pluck('productSpecification')
            ->flatten()
            ->filter()
            ->unique('color')
            ->pluck('color')
            ->values();
    }

    public function setNameAttribute($value)
    {
        $this->attributes['name'] = $value;
        $this->attributes['slug'] = Str::slug($value);
    }
    public function activePromotion(): ?ProductPromotion
    {
        if ($this->cachedActivePromotion !== null) {
            return $this->cachedActivePromotion;
        }

        $now = now();

        return $this->cachedActivePromotion =  ProductPromotion::whereHas(
                'productSpecification.productPricePerSize',
                fn ($q) => $q->where('product_id', $this->id)
            )
            ->where('promotion_start_date', '<=', $now)
            ->where('promotion_end_date', '>=', $now)
            ->first();
    }
    public function getInPromotionAttribute(): bool
    {
        return (bool) $this->activePromotion();
    }
    public function businessDynamics(){

        return $this->belongsToMany(BusinessDynamic::class, 'join_business_dynamic_products', 'product_id', 'business_dynamic_id');
    }
    public function recommendations()
    {
        return $this->hasMany(ProductRecommendation::class, 'product_id');
    }
    public function scopeWithoutAppends($query)
    {
        $this->appends = [];
        return $query;
    }

    public function recommendedProducts()
    {
        return $this->belongsToMany(
            Product::class,
            'product_recommendations',
            'product_id',
            'code'
        );
    }

}

