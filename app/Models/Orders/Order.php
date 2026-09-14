<?php

namespace App\Models\Orders;

use App\Models\Customers\Customer;
use App\Models\Settings\PaymentMethod;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory, HasUlids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $appends = [
        'has_voucher',
        'expires_at',
    ];

    protected $fillable = [
        'code',
        'niubiz_purchase_number',
        'customer_id',
        'customer_email',
        'customer_first_name',
        'customer_last_name',
        'customer_document_type',
        'customer_document_number',
        'customer_mobile_phone',
        'voucher_type',
        'billing_ruc',
        'billing_social_reason',
        'billing_fiscal_address',
        'department_id',
        'province_id',
        'district_id',
        'department_name',
        'province_name',
        'district_name',
        'shipping_address_line',
        'shipping_number',
        'shipping_floor_apartment',
        'shipping_reference',
        'currency',
        'subtotal',
        'delivery_cost',
        'discount_total',
        'total',
        'payment_method_id',
        'payment_method_type',
        'state',
        'placed_at',
        'confirmed_at',
        'paid_at',
        'shipped_at',
        'delivered_at',
        'cancelled_at',
        'notes',
        'admin_notes',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'delivery_cost' => 'decimal:2',
        'discount_total' => 'decimal:2',
        'total' => 'decimal:2',
        'placed_at' => 'datetime',
        'confirmed_at' => 'datetime',
        'paid_at' => 'datetime',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class, 'payment_method_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(OrderPayment::class);
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class)->latest();
    }

    public function scopeOwnedByCustomer($query, string $customerId)
    {
        return $query->where('customer_id', $customerId);
    }

    public function canBeCancelledByCustomer(): bool
    {
        return in_array($this->state, ['pending_payment', 'payment_received', 'preparing'], true);
    }

    public function getHasVoucherAttribute(): bool
    {
        $payment = $this->relationLoaded('payments')
            ? $this->payments->sortByDesc('created_at')->first()
            : $this->payments()->latest()->first();

        return (string) ($payment?->voucher_url ?? '') !== '';
    }

    /**
     * Fecha límite real en la que el backend cancela una orden pendiente de pago
     * (job `orders:expire-pending-transfers`, ventana configurable en días).
     * Solo aplica mientras la orden siga en `pending_payment`.
     */
    public function getExpiresAtAttribute(): ?string
    {
        if ($this->state !== 'pending_payment') {
            return null;
        }

        $reference = $this->placed_at ?? $this->created_at;
        if (!$reference) {
            return null;
        }

        $days = max(1, (int) config('orders.pending_payment_expire_days', 5));

        return $reference->copy()->addDays($days)->toIso8601String();
    }

}
