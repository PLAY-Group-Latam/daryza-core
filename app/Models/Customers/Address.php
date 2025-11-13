<?php

namespace App\Models\Customers;

use App\Models\Ubigeos\Department;
use App\Models\Ubigeos\District;
use App\Models\Ubigeos\Province;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    use HasFactory, HasUlids;

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

    /**
     * Relaciones
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function province()
    {
        return $this->belongsTo(Province::class);
    }

    public function district()
    {
        return $this->belongsTo(District::class);
    }

    /**
     * Accesor moderno — ejemplo para label completo
     */
    protected function label(): Attribute
    {
        return Attribute::make(
            get: fn() => "{$this->address}, {$this->district?->name}, {$this->province?->name}, {$this->department?->name}"
        );
    }
}
