<?php

namespace App\Models\Customers;

use Illuminate\Database\Eloquent\Model;

class NotificationRead extends Model
{
    protected $fillable = [
        'notification_id',
        'customer_id',
        'visitor_id',
        'read_at',
        'is_deleted'
    ];

    protected $casts = [
        'read_at' => 'datetime',
        'is_deleted' => 'boolean',
    ];

    public function notification()
    {
        return $this->belongsTo(Notification::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
