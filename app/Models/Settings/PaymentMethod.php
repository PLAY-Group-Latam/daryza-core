<?php

namespace App\Models\Settings;

use App\Models\Orders\Order;
use App\Models\Orders\OrderPayment;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PaymentMethod extends Model
{
    use HasFactory, HasUlids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'company_type',   
        'name',        
        'account_number', 
        'extra_info',    
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function orders()
    {
        return $this->hasMany(Order::class, 'payment_method_id');
    }

    public function orderPayments()
    {
        return $this->hasMany(OrderPayment::class, 'payment_method_id');
    }
}
