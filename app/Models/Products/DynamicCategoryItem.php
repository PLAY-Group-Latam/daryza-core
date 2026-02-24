<?php

namespace App\Models\Products;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DynamicCategoryItem extends Model
{
    protected $fillable = [
        'dynamic_category_id',
        'product_id',
        'variant_id',
    ];

    /**
     * La categoría a la que pertenece este item.
     */
    public function dynamicCategory(): BelongsTo
    {
        return $this->belongsTo(DynamicCategory::class, 'dynamic_category_id');
    }

    /**
     * El producto padre (para SEO o listados generales).
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    /**
     * La variante específica (la que tiene el SKU y atributos).
     */
    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }
}
