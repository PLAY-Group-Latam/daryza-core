<?php

namespace App\Models\Ubigeos;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;

class Department extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'ubigeo_code',
        'name',
        'iso_code',
        'label',
        'searchable',
        'children_count',
    ];

    /**
     * Relaciones
     */
    public function provinces()
    {
        return $this->hasMany(Province::class);
    }

    // 👇 Mutador moderno para label
    protected function label(): Attribute
    {
        return Attribute::make(
            set: fn($value, $attributes) => $value ?? $attributes['name']
        );
    }

    // 👇 Mutador moderno para searchable
    protected function searchable(): Attribute
    {
        return Attribute::make(
            set: fn($value, $attributes) => 
                $value ?? strtolower(str_replace(' ', '', $attributes['name']))
        );
    }
}
