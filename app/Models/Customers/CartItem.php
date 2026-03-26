<?php

namespace App\Models\Customers;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class CartItem extends Model
{
    use HasFactory, HasUlids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'cart_id',
        'item_id',
        'item_type',
        'quantity',
        'currency',
        'unit_price',
        'metadata',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'metadata' => 'array',
    ];

    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    public function item(): MorphTo
    {
        return $this->morphTo();
    }
}
