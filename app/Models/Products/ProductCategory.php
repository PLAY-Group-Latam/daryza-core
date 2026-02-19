<?php

namespace App\Models\Products;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\EloquentSortable\Sortable;
use Spatie\EloquentSortable\SortableTrait;

class ProductCategory extends Model implements Sortable
{
    use SortableTrait, HasFactory, HasUlids;

    protected $table = 'product_categories';

    protected $fillable = [
        'name',
        'slug',
        'image',
        'parent_id',
        'order',
        'is_active',
    ];

    public $sortable = [
        'order_column_name' => 'order',
        'sort_when_creating' => true,
    ];

    /**
     * Indica que la clave primaria no es incremental
     * porque usamos ULID.
     */
    public $incrementing = false;

    /**
     * El tipo de la clave primaria es string
     */
    protected $keyType = 'string';

    public function buildSortQuery()
    {
        return static::query()
            ->when(
                is_null($this->parent_id),
                fn($q) => $q->whereNull('parent_id'),
                fn($q) => $q->where('parent_id', $this->parent_id)
            );
    }


    // Categoría padre
    public function parent()
    {
        return $this->belongsTo(ProductCategory::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(ProductCategory::class, 'parent_id')->orderBy('order');
    }


    /**
     * Relaciones de negocio
     */

    /**
     * Productos vinculados a esta categoría.
     * Cambiamos de hasMany a belongsToMany para usar la tabla pivote.
     */
    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_category', 'category_id', 'product_id')
            ->withTimestamps();
    }


    // Media (imagen de categoría, banners, etc)
    public function media()
    {
        return $this->morphMany(ProductMedia::class, 'mediable');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeRoots($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * ¿Por qué es más simple? 
     * Como tu límite son 2 niveles, no necesitas un 'while'.
     * Si la categoría tiene un padre, ya está en el nivel 2.
     */
    public function canCreateChild(): bool
    {
        return is_null($this->parent_id);
    }
}
