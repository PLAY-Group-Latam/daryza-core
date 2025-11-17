<?php

namespace App\Models\Customers;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Customer extends Authenticatable
{
    use HasFactory, HasUlids, SoftDeletes, HasApiTokens, Notifiable;

    protected $fillable = [
        'full_name',
        'email',
        'phone',
        'password',
        'google_id',
        'photo',
        'dni',
    ];

    /**
     * Relaciones
     */
    public function billingProfiles()
    {
        return $this->hasMany(BillingProfile::class);
    }

    public function addresses()
    {
        return $this->hasMany(Address::class);
    }

    /**
     * Accesor moderno para mostrar nombre capitalizado
     */
    protected function fullName(): Attribute
    {
        return Attribute::make(
            get: fn($value) => ucwords(strtolower($value)),
        );
    }


    /**
     * Mutador: asegurar que el email siempre se guarde en minúsculas.
     */
    public function setEmailAttribute($value)
    {
        $this->attributes['email'] = strtolower(trim($value));
    }
}
