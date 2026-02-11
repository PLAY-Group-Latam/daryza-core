<?php

namespace App\Models\Products;

use App\Models\Metadata;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProductCategory extends Model
{
    use HasFactory, HasUlids;

    protected $table = 'product_categories';

    protected $fillable = [
        'name',
        'slug',
        'image',
        'parent_id',
        'order',
        'is_active',
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


    // Categoría padre
    public function parent()
    {
        return $this->belongsTo(ProductCategory::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(ProductCategory::class, 'parent_id')
            ->orderBy('order')
            ->with('children');
    }

    public function activeChildren()
    {
        return $this->hasMany(ProductCategory::class, 'parent_id')
            ->active()
            ->orderBy('order')
            ->with('activeChildren');
    }

    /**
     * Relaciones de negocio
     */

    // Productos dentro de esta categoría
    // public function products()
    // {
    //     return $this->hasMany(Product::class, 'category_id');
    // }
    /**
     * Productos vinculados a esta categoría.
     * Cambiamos de hasMany a belongsToMany para usar la tabla pivote.
     */
    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_category', 'category_id', 'product_id')
            ->using(ProductCategoryPivot::class) // <--- ESTO ES LO QUE CONECTA AL PIVOT
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

    public function depth(): int
    {
        $level = 1;
        $current = $this->parent;

        while ($current) {
            $level++;
            $current = $current->parent;
        }

        return $level;
    }

    public function canCreateChild(): bool
    {
        return $this->depth() < 2;
    }

    public function deactivateDescendants(): void
    {
        $this->children()->update(['is_active' => false]);
    }
}
