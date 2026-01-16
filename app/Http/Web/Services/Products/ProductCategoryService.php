<?php

namespace App\Http\Web\Services\Products;

use App\Models\Products\ProductCategory;

class ProductCategoryService
{
    /**
     * Actualiza una categoría y reordena a sus hermanos si cambia el order.
     */
    public function updateCategory(ProductCategory $category, array $data): array
    {
        $previousOrder = $category->order;
        $previousIsActive = $category->is_active;

        // Validar y reacomodar order si existe
        if (isset($data['order']) && $data['order'] != $previousOrder) {
            $siblings = ProductCategory::where('parent_id', $category->parent_id)
                ->where('id', '!=', $category->id)
                ->orderBy('order')
                ->get();

            $maxOrder = $siblings->count() + 1;
            $newOrder = (int) $data['order'];

            if ($newOrder < 1 || $newOrder > $maxOrder) {
                return [
                    'success' => false,
                    'error' => "El orden debe estar entre 1 y {$maxOrder}."
                ];
            }

            // Reordenamos
            $currentOrder = 1;
            foreach ($siblings as $sibling) {
                if ($currentOrder == $newOrder) $currentOrder++;
                if ($sibling->order != $currentOrder) $sibling->update(['order' => $currentOrder]);
                $currentOrder++;
            }

            $category->order = $newOrder;
        }

        // Actualizar los demás campos
        $category->update($data);

        // Desactivar descendientes si corresponde
        if ($previousIsActive && !$category->is_active) {
            $category->deactivateDescendants();
        }

        return ['success' => true];
    }
}
