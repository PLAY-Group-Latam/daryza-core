<?php

namespace App\Http\Web\Services\Products;

use App\Models\Products\DynamicCategory;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DynamicCategoryService
{
    public function create(array $data): DynamicCategory
    {
        $this->ensureNoDuplicateItems($data['items'] ?? []);

        return DB::transaction(function () use ($data) {
            $category = DynamicCategory::create(collect($data)->except('items')->toArray());

            foreach ($data['items'] as $item) {
                $category->items()->create([
                    'product_id' => $item['product_id'],
                    'variant_id' => $item['variant_id'],
                ]);
            }

            return $category;
        });
    }

    public function update(DynamicCategory $dynamicCategory, array $data): DynamicCategory
    {
        $this->ensureNoDuplicateItems($data['items'] ?? []);

        return DB::transaction(function () use ($dynamicCategory, $data) {
            $dynamicCategory->update(collect($data)->except('items')->toArray());
            $dynamicCategory->items()->delete();

            foreach ($data['items'] as $item) {
                $dynamicCategory->items()->create([
                    'product_id' => $item['product_id'],
                    'variant_id' => $item['variant_id'],
                ]);
            }

            return $dynamicCategory;
        });
    }

    public function delete(DynamicCategory $dynamicCategory): void
    {
        DB::transaction(function () use ($dynamicCategory) {
            $dynamicCategory->items()->delete();
            $dynamicCategory->delete();
        });
    }

    private function ensureNoDuplicateItems(array $items): void
    {
        $signatures = collect($items)
            ->map(fn($item) => ($item['product_id'] ?? '') . '|' . ($item['variant_id'] ?? ''));

        if ($signatures->count() !== $signatures->unique()->count()) {
            throw ValidationException::withMessages([
                'items' => 'No se permiten ítems duplicados (mismo producto y variante).',
            ]);
        }
    }
}
