<?php

namespace App\Models\Coupons;

use App\Models\Customers\Customer;
use App\Models\Orders\Order;
use App\Models\Products\DynamicCategory;
use App\Models\Products\Product;
use App\Models\Products\ProductCategory;
use App\Models\Products\ProductPack;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Coupon extends Model
{
    use HasFactory, HasUlids, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'code',
        'description',
        'discount_type',
        'discount_amount',
        'maximum_discount_amount',
        'minimum_order_amount',
        'scope',
        'is_active',
        'is_public',
        'usage_limit',
        'usage_limit_per_user',
        'valid_from',
        'valid_until',
    ];

    protected $casts = [
        'discount_amount'         => 'decimal:2',
        'maximum_discount_amount' => 'decimal:2',
        'minimum_order_amount'    => 'decimal:2',
        'is_active'               => 'boolean',
        'is_public'               => 'boolean',
        'valid_from'              => 'datetime',
        'valid_until'             => 'datetime',
    ];

    // ─── Relaciones ───────────────────────────────────────────

    public function products()
    {
        return $this->belongsToMany(Product::class, 'coupon_products', 'coupon_id', 'product_id');
    }

    public function categories()
    {
        return $this->belongsToMany(ProductCategory::class, 'coupon_categories', 'coupon_id', 'category_id');
    }

    public function packs()
    {
        return $this->belongsToMany(ProductPack::class, 'coupon_packs', 'coupon_id', 'pack_id');
    }

    public function businessDynamics()
    {
        return $this->belongsToMany(DynamicCategory::class, 'coupon_business_dynamics', 'coupon_id', 'dynamic_category_id');
    }

    public function customers()
    {
        return $this->belongsToMany(Customer::class, 'coupon_customers', 'coupon_id', 'customer_id');
    }

    public function redemptions()
    {
        return $this->hasMany(CouponRedemption::class);
    }

    // ─── Métodos ──────────────────────────────────────────────

    public function isActive(): bool
    {
        $now = now();

        return $this->is_active
            && (is_null($this->valid_from) || $this->valid_from <= $now)
            && (is_null($this->valid_until) || $this->valid_until >= $now);
    }

    public function isUsable(): bool
    {
        if (!$this->isActive()) {
            return false;
        }

        if (!is_null($this->usage_limit) && $this->totalUses() >= $this->usage_limit) {
            return false;
        }

        return true;
    }

    public function isUsableByUser(string $customerId): bool
    {
        if (!$this->isUsable()) {
            return false;
        }

        if (!is_null($this->usage_limit_per_user) && $this->usesByUser($customerId) >= $this->usage_limit_per_user) {
            return false;
        }

        return true;
    }

    public function totalUses(): int
    {
        return $this->redemptions()->count();
    }

    public function usesByUser(string $customerId): int
    {
        return $this->redemptions()->where('customer_id', $customerId)->count();
    }

    public function getFormattedDiscountAttribute(): string
    {
        return $this->discount_type === 'percentage'
            ? number_format($this->discount_amount, 0) . '%'
            : 'S/ ' . number_format($this->discount_amount, 2);
    }
}
