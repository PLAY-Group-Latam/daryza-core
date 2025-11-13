<?php

namespace App\Models\Ubigeos;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;

class Province extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'ubigeo_code',
        'name',
        'label',
        'searchable',
        'children_count',
        'department_id',
    ];

    /**
     * Relaciones
     */
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function districts()
    {
        return $this->hasMany(District::class);
    }

    /**
     * Accesores / Mutadores
     */
    protected static function booted()
    {
        static::saving(function ($province) {
            if ($province->department) {
                $province->label = "{$province->name}, {$province->department->name}";
                $province->searchable = strtolower(str_replace(' ', '', $province->label));
            }
        });

        static::created(function ($province) {
            // Actualiza el contador del departamento
            $province->department?->increment('children_count');
        });

        static::deleted(function ($province) {
            $province->department?->decrement('children_count');
        });
    }
}
