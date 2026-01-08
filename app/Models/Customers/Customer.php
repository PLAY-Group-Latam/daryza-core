<?php

namespace App\Models\Customers;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class Customer extends Authenticatable implements JWTSubject
{
    use HasFactory, HasUlids, SoftDeletes, Notifiable;

    protected $fillable = [
        'full_name',
        'email',
        'phone',
        'password',
        'google_id',
        'photo',
        'dni',
    ];


    protected $hidden = [
        'password',
        // 'token',
        // 'remember_token',
    ];
    /**
     * Relaciones
     */
    public function billingProfile()
    {
        return $this->hasOne(BillingProfile::class);
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



    // Identificador único del usuario para JWT
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    // Claims personalizados para JWT (opcional)
    public function getJWTCustomClaims()
    {
        return [];
    }
}
