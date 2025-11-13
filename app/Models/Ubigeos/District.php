<?php

namespace App\Models\Ubigeos;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;

class District extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'ubigeo_code',
        'name',
        'label',
        'searchable',
        'province_id',
    ];

    /**
     * Relaciones
     */
    public function province()
    {
        return $this->belongsTo(Province::class);
    }

    public function department()
    {
        return $this->hasOneThrough(Department::class, Province::class, 'id', 'id', 'province_id', 'department_id');
    }

    /**
     * Mutadores modernos (Laravel >= 9)
     */
    protected function label(): Attribute
    {
        return Attribute::make(
            set: function ($value, $attributes) {
                if ($value) return $value;

                $province = $this->province()->first();
                $department = $province?->department()->first();

                if ($province && $department) {
                    return "{$attributes['name']}, {$province->name}, {$department->name}";
                }

                return $attributes['name'];
            },
        );
    }

    protected function searchable(): Attribute
    {
        return Attribute::make(
            set: function ($value, $attributes) {
                $label = $attributes['label'] ?? $this->label;
                return strtolower(str_replace(' ', '', $label ?? $attributes['name']));
            }
        );
    }

    /**
     * Eventos de modelo (solo para manejar children_count)
     */
    protected static function booted()
    {
        static::created(function ($district) {
            $district->province?->increment('children_count');
        });

        static::deleted(function ($district) {
            $district->province?->decrement('children_count');
        });
    }
}
