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
use Illuminate\Support\Facades\Cache;

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
        $isPack    = filter_var($params['is_pack'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $isOnOffer = filter_var($params['on_offer'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $priceMin  = isset($params['price_min']) ? (float) $params['price_min'] : null;
        $priceMax  = isset($params['price_max']) ? (float) $params['price_max'] : null;
        $sort      = $params['sort'] ?? 'relevance';
        $perPage   = $params['per_page'] ?? 12;

        // --- LÓGICA PARA PACKS ---
        if ($isPack) {
            $query = ProductPack::where('is_active', true)->with(['mainImage']);

            if ($isOnOffer) {
                $query->where('is_on_promotion', true);
            }

            if ($priceMin !== null) {
                $query->where(fn($q) => $q->where('price', '>=', $priceMin)->orWhere('promo_price', '>=', $priceMin));
            }
            if ($priceMax !== null) {
                $query->where(fn($q) => $q->where('price', '<=', $priceMax)->orWhere('promo_price', '<=', $priceMax));
            }

            // Ordenamiento específico para Packs (no tienen variantes)
            $this->applySortingForPacks($query, $sort);

            return $query->paginate($perPage);
        }

        // --- LÓGICA PARA PRODUCTOS ---
       $query = Product::where('products.is_active', true)
    ->whereNull('products.deleted_at')
    ->with(['mainVariant.mainImage']);

        collect($this->pipeline($params))
            ->filter(fn($filter) => $filter['active'])
            ->each(fn($filter) => $filter['apply']($query));

        // Aplicamos el ordenamiento antes de paginar
        $this->applySorting($query, $sort);

return $query->paginate($perPage);
    }

private function applySorting(Builder $query, string $sort): void
{
    // Limpiamos órdenes previos para evitar conflictos
    $query->getQuery()->orders = null;

    switch ($sort) {
        case 'price-low':
        case 'price-high':
            $direction = ($sort === 'price-low') ? 'asc' : 'desc';

            $query->leftJoin('product_variants as pv', function ($join) {
                $join->on('products.id', '=', 'pv.product_id')
                     ->where('pv.is_main', true)
                     ->whereNull('pv.deleted_at');
            })
            // IMPORTANTE: Seleccionamos solo las columnas de productos con prefijo
            ->select('products.*') 
            ->orderBy('pv.price', $direction);
            break;

        case 'name-asc':
            $query->orderBy('products.name', 'asc');
            break;

        case 'name-desc':
            $query->orderBy('products.name', 'desc');
            break;

        case 'newest':
            $query->orderBy('products.created_at', 'desc');
            break;

        case 'relevance':
        default:
            $query->orderBy('products.is_home', 'desc')
                  ->orderBy('products.created_at', 'desc');
            break;
    }
}

    private function applySortingForPacks(Builder $query, string $sort): void
    {
        switch ($sort) {
            case 'price-low': $query->orderBy('price', 'asc'); break;
            case 'price-high': $query->orderBy('price', 'desc'); break;
            case 'name-asc': $query->orderBy('name', 'asc'); break;
            case 'name-desc': $query->orderBy('name', 'desc'); break;
            default: $query->latest(); break;
        }
    }

    private function pipeline(array $params): array
    {
        $priceMin = isset($params['price_min']) ? (float) $params['price_min'] : null;
        $priceMax = isset($params['price_max']) ? (float) $params['price_max'] : null;

        return [
            [
                'active' => !empty($params['categories']) || !empty($params['categoria']) ||
                            !empty($params['subcategories']) || !empty($params['subcategoria']),
                'apply'  => fn(Builder $q) => $q->where(function ($query) use ($params) {
                    $subInput = $params['subcategories'] ?? $params['subcategoria'] ?? null;
                    if (!empty($subInput)) {
                        $subIds = $this->resolveCategoryIds($subInput, true);
                        $query->whereHas('categories', fn($c) => $c->whereIn('product_categories.id', $subIds));
                    } else {
                        $catInput = $params['categories'] ?? $params['categoria'] ?? null;
                        if (!empty($catInput)) {
                            $catIds = $this->resolveCategoryIds($catInput, false);
                            $query->whereHas('categories', fn($c) => $c->whereIn('product_categories.id', $catIds));
                        }
                    }
                }),
            ],
            [
                'active' => !empty($params['dynamics']) || !empty($params['dinamica']),
                'apply'  => fn(Builder $q) => $q->where(function ($query) use ($params) {
                    $dynInput = $params['dynamics'] ?? $params['dinamica'] ?? null;
                    if (!empty($dynInput)) {
                        $dynamicIds = $this->resolveDynamicIds($dynInput);
                        if (!empty($dynamicIds)) {
                            $query->whereExists(function ($sub) use ($dynamicIds) {
                                $sub->selectRaw(1)
                                    ->from('dynamic_category_items')
                                    ->whereColumn('dynamic_category_items.product_id', 'products.id')
                                    ->whereIn('dynamic_category_id', $dynamicIds);
                            });
                        }
                    }
                }),
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
            [
                'active' => $priceMin !== null || $priceMax !== null,
                'apply'  => fn(Builder $q) => $q->whereHas('mainVariant', function (Builder $v) use ($priceMin, $priceMax) {
                    $v->where(function ($sub) use ($priceMin, $priceMax) {
                        $sub->where(function ($promo) use ($priceMin, $priceMax) {
                            $promo->where('is_on_promo', true)->whereNotNull('promo_price');
                            if ($priceMin !== null) $promo->where('promo_price', '>=', $priceMin);
                            if ($priceMax !== null) $promo->where('promo_price', '<=', $priceMax);
                        })->orWhere(function ($normal) use ($priceMin, $priceMax) {
                            $normal->where(fn($q) => $q->where('is_on_promo', false)->orWhereNull('promo_price'));
                            if ($priceMin !== null) $normal->where('price', '>=', $priceMin);
                            if ($priceMax !== null) $normal->where('price', '<=', $priceMax);
                        });
                    });
                }),
            ],
        ];
    }

    private function buildSidebar(array $params): array
    {
        $catInput = $params['subcategoria'] ?? $params['categories'] ?? $params['categoria'] ?? [];
        $selectedCategoryIds = $this->resolveCategoryIds($catInput);

        $staticSidebar = Cache::remember('sidebar_static', 300, function () {
            $categories = ProductCategory::roots()->active()->get(['id', 'name', 'slug'])
                ->map(fn($item) => ['id' => $item->id, 'name' => $item->name, 'slug' => $item->slug, 'type' => 'standard']);

            $dynamics = DynamicCategory::where('is_active', true)->get(['id', 'name', 'slug'])
                ->map(fn($item) => ['id' => $item->id, 'name' => $item->name, 'slug' => $item->slug, 'type' => 'dynamic']);

            $brands = AttributesValue::whereHas('attribute', fn($q) => $q->where('name', 'ILIKE', '%Marca%'))
                ->get(['id', 'value as name'])
                ->unique(fn($item) => strtolower(trim($item->name)))
                ->values();

            $businessLines = BusinessLine::where('is_active', true)->get(['id', 'name', 'slug']);

            return compact('categories', 'dynamics', 'brands', 'businessLines');
        });

        return [
            'categories'     => $staticSidebar['categories']->concat($staticSidebar['dynamics']),
            'subcategories'  => empty($selectedCategoryIds) ? [] : ProductCategory::whereIn('parent_id', $selectedCategoryIds)
                ->active()
                ->with('parent:id,name')
                ->get(['id', 'name', 'slug', 'parent_id'])
                ->groupBy(fn($item) => $item->parent->name),
            'brands'         => $staticSidebar['brands'],
            'business_lines' => $staticSidebar['businessLines'],
            'specials'       => [
                ['id' => 'packs',  'name' => 'Packs',                  'key' => 'is_pack'],
                ['id' => 'offers', 'name' => 'Ofertas y Promociones',  'key' => 'on_offer'],
            ],
        ];
    }

    private function resolveCategoryIds(mixed $categories, bool $isSubcategory = false): array
    {
        $values = array_filter((array) $categories);
        if (empty($values)) return [];

        $query = ProductCategory::query();
        if (!preg_match('/^[A-Z0-9]{20,}$/', $values[0])) {
            $query->whereIn('slug', $values);
        } else {
            $query->whereIn('id', $values);
        }

        $baseCategories = $query->get(['id', 'parent_id']);
        $allIds = $baseCategories->pluck('id')->toArray();

        if (!$isSubcategory) {
            foreach ($baseCategories as $cat) {
                if (empty($cat->parent_id)) {
                    $childrenIds = ProductCategory::where('parent_id', $cat->id)->pluck('id')->toArray();
                    $allIds = array_merge($allIds, $childrenIds);
                }
            }
        }

        return array_unique($allIds);
    }

    private function resolveDynamicIds(mixed $dynamics): array
    {
        $values = array_filter((array) $dynamics);
        if (empty($values)) return [];
        if (!preg_match('/^[A-Z0-9]{20,}$/', $values[0])) {
            return DynamicCategory::whereIn('slug', $values)->pluck('id')->toArray();
        }
        return $values;
    }
}