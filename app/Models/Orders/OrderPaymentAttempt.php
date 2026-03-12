<?php

namespace App\Models\Orders;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderPaymentAttempt extends Model
{
    use HasFactory, HasUlids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'order_id',
        'purchase_number',
        'transaction_token',
        'status',
        'is_approved',
        'authorization_code',
        'transaction_id',
        'brand',
        'masked_card',
        'response_code',
        'response_message',
        'niubiz_payload',
        'error_message',
        'processed_at',
    ];

    protected $casts = [
        'is_approved' => 'boolean',
        'niubiz_payload' => 'array',
        'processed_at' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}

