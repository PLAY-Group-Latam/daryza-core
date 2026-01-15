<?php

namespace App\Models\Products;

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
