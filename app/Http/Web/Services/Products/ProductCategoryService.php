<?php

namespace App\Http\Web\Services\Products;

use App\Models\Products\ProductCategory;

class ProductCategoryService
{
    public function updateCategory(ProductCategory $category, array $data): array
    {
        $previousIsActive = $category->is_active;

        if ($this->isOrderChanged($category, $data)) {
            $result = $this->reorderSiblings($category, (int)$data['order']);

            if (!$result['success']) {
                return $result;
            }

            $category->order = (int)$data['order'];
        }

        $category->update($data);

        $this->handleDeactivation($category, $previousIsActive);

        return ['success' => true];
    }

    private function isOrderChanged(ProductCategory $category, array $data): bool
    {
        return isset($data['order']) && $data['order'] != $category->order;
    }

    private function reorderSiblings(ProductCategory $category, int $newOrder): array
    {
        $siblings = ProductCategory::where('parent_id', $category->parent_id)
            ->where('id', '!=', $category->id)
            ->orderBy('order')
            ->get();

        $maxOrder = $siblings->count() + 1;

        if ($newOrder < 1 || $newOrder > $maxOrder) {
            return [
                'success' => false,
                'error' => "El orden debe estar entre 1 y {$maxOrder}."
            ];
        }

        $this->applyNewOrderToSiblings($siblings, $newOrder);

        return ['success' => true];
    }

    private function applyNewOrderToSiblings($siblings, int $newOrder): void
    {
        $currentOrder = 1;

        foreach ($siblings as $sibling) {
            if ($currentOrder === $newOrder) {
                $currentOrder++;
            }

            if ($sibling->order !== $currentOrder) {
                $sibling->update(['order' => $currentOrder]);
            }

            $currentOrder++;
        }
    }

    private function handleDeactivation(ProductCategory $category, bool $previousIsActive): void
    {
        if ($previousIsActive && !$category->is_active) {
            $category->deactivateDescendants();
        }
    }
}
