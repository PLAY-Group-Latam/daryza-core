<?php

namespace App\Http\Api\v1\Services\Products;

use App\Models\Products\Product;
use App\Models\Products\ProductPack;
use App\Models\Products\ProductCategory;
use App\Models\Products\DynamicCategory;
use App\Models\Products\BusinessLine;
use App\Models\Products\AttributesValue;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ProductFilterService
{
    public function applyFilters(array $params): array
    {
        $results = $this->resolveItems($params);

        return [
            'items'      => $results->items(),
            'sidebar'    => $this->buildSidebar($params),
            'pagination' => [
                'total'        => $results->total(),
                'current_page' => $results->currentPage(),
                'last_page'    => $results->lastPage(),
                'per_page'     => $results->perPage(),
            ],
        ];
    }

    private function resolveItems(array $params): LengthAwarePaginator
    {
        if (filter_var($params['is_pack'] ?? false, FILTER_VALIDATE_BOOLEAN)) {
            return ProductPack::where('is_active', true)
                ->with(['mainImage'])
                ->latest()
                ->paginate($params['per_page'] ?? 12);
        }

        $query = Product::active()
            ->with(['mainVariant.mainImage', 'categories', 'businessLines']);

        collect($this->pipeline($params))
            ->filter(fn($filter) => $filter['active'])
            ->each(fn($filter)   => $filter['apply']($query));

        return $query->latest()->paginate($params['per_page'] ?? 12);
    }

    private function pipeline(array $params): array
    {
        return [
            [
                'active' => !empty($params['categories']),
                'apply'  => fn(Builder $q) => $q->whereHas('categories', fn(Builder $c) =>
                    $c->whereIn('product_categories.id', $this->resolveCategoryIds($params['categories']))
                ),
            ],
            // --- NUEVO FILTRO PARA DINÁMICAS ---
            [
                'active' => !empty($params['dynamics']),
                'apply'  => fn(Builder $q) => $q->whereHas('dynamicCategories', fn(Builder $d) =>
                    $d->whereIn('dynamic_category_id', (array) $params['dynamics'])
                ),
            ],
            // -----------------------------------
            [
                'active' => !empty($params['subcategories']),
                'apply'  => fn(Builder $q) => $q->whereHas('categories', fn(Builder $c) =>
                    $c->whereIn('product_categories.id', (array) $params['subcategories'])
                        ->whereNotNull('product_categories.parent_id')
                ),
            ],
            [
                'active' => !empty($params['brands']),
                'apply'  => fn(Builder $q) => $q->whereHas('variants.specifications', fn(Builder $s) =>
                    $s->whereIn('attribute_value_id', (array) $params['brands'])
                ),
            ],
            [
                'active' => filter_var($params['on_offer'] ?? false, FILTER_VALIDATE_BOOLEAN),
                'apply'  => fn(Builder $q) => $q->whereHas('variants', fn(Builder $v) => $v->onPromo()),
            ],
            [
                'active' => !empty($params['business_lines']),
                'apply'  => fn(Builder $q) => $q->whereHas('businessLines', fn(Builder $b) =>
                    $b->whereIn('business_lines.id', (array) $params['business_lines'])
                ),
            ],
        ];
    }

    private function buildSidebar(array $params): array
    {
        $selectedCategoryIds = (array) ($params['categories'] ?? []);

        // Obtenemos las categorías base
        $categories = ProductCategory::roots()->active()->get(['id', 'name', 'slug'])
            ->map(fn($item) => [
                'id'   => $item->id,
                'name' => $item->name,
                'slug' => $item->slug,
                'type' => 'standard' // Identificador
            ]);

        // Obtenemos las dinámicas
        $dynamics = DynamicCategory::where('is_active', true)->get(['id', 'name', 'slug'])
            ->map(fn($item) => [
                'id'   => $item->id,
                'name' => $item->name,
                'slug' => $item->slug,
                'type' => 'dynamic' // Identificador
            ]);

        return [
            // UNIFICADO: Listamos ambas juntas en la misma llave 'categories'
            'categories' => $categories->concat($dynamics),

            'subcategories' => ProductCategory::whereIn('parent_id', $selectedCategoryIds)
                ->active()
                ->with('parent:id,name')
                ->get(['id', 'name', 'slug', 'parent_id'])
                ->groupBy(fn($item) => $item->parent->name),

            'brands' => AttributesValue::whereHas('attribute', fn($q) =>
                $q->where('name', 'ILIKE', '%Marca%')
            )->get(['id', 'value as name']),

            'business_lines' => BusinessLine::where('is_active', true)
                ->get(['id', 'name', 'slug']),

            'specials' => [
                ['id' => 'packs',  'name' => 'Packs', 'key' => 'is_pack'],
                ['id' => 'offers', 'name' => 'Ofertas y Promociones', 'key' => 'on_offer'],
            ],
        ];
    }

    private function resolveCategoryIds(mixed $categories): array
    {
        $ids = (array) $categories;
        return ProductCategory::whereIn('id', $ids)
            ->orWhereIn('parent_id', $ids)
            ->pluck('id')
            ->toArray();
    }
}