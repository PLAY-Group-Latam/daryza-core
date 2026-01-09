<?php

namespace App\Models\Customers;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class BillingProfile extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'ruc',
        'social_reason',
        'customer_id',
    ];
    
     protected $hidden = [
        'id',
        'customer_id',
        'created_at',
        'updated_at',
    ];

    /**
     * Relaciones
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
