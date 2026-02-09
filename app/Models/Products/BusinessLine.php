<?php

namespace App\Models\Products;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class BusinessLine extends Model
{
    use HasFactory, HasUlids;

    /**
     * Los atributos que se pueden asignar masivamente.
     */
    protected $fillable = [
        'name',
        'slug',
        'image',
        'is_active',
    ];

    /**
     * Casts para tipos de datos específicos.
     */
    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Boot del modelo para generar el slug automáticamente si no viene en el request.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->slug)) {
                $model->slug = Str::slug($model->name);
            }
        });
    }

    /**
     * Relación con los productos (Muchos a Muchos).
     * Nota: Apuntamos a la tabla pivote que creamos antes.
     */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(
            Product::class, 
            'product_business_line', 
            'business_line_id', 
            'product_id'
        )->withTimestamps();
    }
}