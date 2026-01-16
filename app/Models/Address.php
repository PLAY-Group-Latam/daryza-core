<?php

namespace App\Models;

use App\Models\Customers\Customer;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Address extends Model
{
    /** @use HasFactory<\Database\Factories\AddressFactory> */
    use HasFactory,HasUuids;
    protected $keyType = 'string';
    public $incrementing = false;
    protected $fillable = [
        'address',
        'department_id',
        'province_id',
        'district_id',
        'country',
        'postal_code',
        'reference',
        'customer_id',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class, 'province_id');
    }

    public function district(): BelongsTo
    {
        return $this->belongsTo(District::class, 'district_id');
    }

    static public function getAddressByCustomerId(string $customerId): ?Address
    {
        return self::where('customer_id', $customerId)->first();
    }
}

