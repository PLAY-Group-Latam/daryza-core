<?php

namespace App\Models;

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
}