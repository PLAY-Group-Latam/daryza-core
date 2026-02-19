<?php

namespace App\Models\Products;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

class ProductPack extends Model
{
    use HasUlids, SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'slug',
        'brief_description',
        'description',
        'price',
        'promo_price',
        'is_active',
        'show_on_home',
        'is_on_promotion',
        'promo_start_at',
        'promo_end_at',
        'stock'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'promo_price' => 'decimal:2',
        'is_active' => 'boolean',
        'show_on_home' => 'boolean',
        'is_on_promotion' => 'boolean',
        'promo_start_at' => 'datetime',
        'promo_end_at' => 'datetime',
    ];


    /**
     * Relación con los items/componentes del pack
     */
    public function items(): HasMany
    {
        return $this->hasMany(ProductPackItem::class, 'product_pack_id');
    }

    /**
     * Scope para packs activos y visibles en Home
     */
    public function scopeActiveOnHome(Builder $query): void
    {
        $query->where('is_active', true)
            ->where('show_on_home', true)
            ->where(function ($q) {
                $q->where('is_on_promotion', false)
                    ->orWhere(function ($sub) {
                        $sub->where('is_on_promotion', true)
                            ->where('promo_start_at', '<=', now())
                            ->where('promo_end_at', '>=', now());
                    });
            });
    }

    /**
     * Accesor para obtener el precio actual (normal o promo)
     */
    public function getFinalPriceAttribute(): float
    {
        $now = now();
        if ($this->is_on_promotion && $this->promo_start_at <= $now && $this->promo_end_at >= $now) {
            return (float) ($this->promo_price ?? $this->price);
        }
        return (float) $this->price;
    }
}
