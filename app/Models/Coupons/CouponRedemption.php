<?php

namespace App\Models\Coupons;

use App\Models\Customers\Customer;
use App\Models\Orders\Order;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CouponRedemption extends Model
{
    use HasFactory, HasUlids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'coupon_id',
        'customer_id',
        'order_id',
        'discount_applied',
        'redeemed_at',
    ];

    protected $casts = [
        'discount_applied' => 'decimal:2',
        'redeemed_at'      => 'datetime',
    ];

    // ─── Relaciones ───────────────────────────────────────────

    public function coupon()
    {
        return $this->belongsTo(Coupon::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}