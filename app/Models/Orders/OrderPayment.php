<?php

namespace App\Models\Orders;

use App\Models\Settings\PaymentMethod;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderPayment extends Model
{
    use HasFactory, HasUlids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'order_id',
        'payment_method_id',
        'method',
        'status',
        'amount',
        'voucher_url',
        'voucher_uploaded_at',
        'gateway_transaction_id',
        'gateway_authorization_code',
        'gateway_brand',
        'gateway_masked_card',
        'gateway_payload',
        'paid_at',
        'rejected_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'voucher_uploaded_at' => 'datetime',
        'gateway_payload' => 'array',
        'paid_at' => 'datetime',
        'rejected_at' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class, 'payment_method_id');
    }
}
