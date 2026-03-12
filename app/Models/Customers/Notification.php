<?php

namespace App\Models\Customers;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasUlids;

    protected $fillable = [
        'type',
        'title',
        'message',
        'data'
    ];

    protected $casts = [
        'data' => 'array',
    ];

    public $timestamps = false;

    public function reads()
    {
        return $this->hasMany(NotificationRead::class);
    }
}