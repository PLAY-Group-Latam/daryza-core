<?php

namespace App\Models\Events;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Customers\Customer;

class EventLog extends Model
{
    protected $fillable = [
        'customer_id',
        'session_id',
        'event_type',
        'event_data',
    ];

    protected $casts = [
        'event_data' => 'array',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
