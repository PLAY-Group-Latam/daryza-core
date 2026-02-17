<?php

namespace App\Observers\Web\Product;

use App\Models\Products\ProductCategory;

class ProductCategoryObserver
{
    /**
     * Antes de crear: Asignar orden automático.
     */
    public function creating(ProductCategory $category): void
    {
        if (is_null($category->order)) {
            $category->order = ProductCategory::where('parent_id', $category->parent_id)->max('order') + 1;
        }
    }

    /**
     * Después de actualizar: Desactivar hijos en cascada si la madre se desactiva.
     */
    public function updated(ProductCategory $category): void
    {
        // Solo actuamos si se cambió el switch de activación
        if ($category->wasChanged('is_active')) {

            // Como solo hay 2 niveles, no necesitamos disparar más Observers.
            // Hacemos un update masivo a los hijos en una sola consulta SQL.
            $category->children()->update([
                'is_active' => $category->is_active
            ]);
        }
    }
}
