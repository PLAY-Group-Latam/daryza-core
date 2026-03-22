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

        if ($isPack) {
            $query = ProductPack::where('is_active', true)->with(['mainImage']);

            if ($isOnOffer) {
                $query->where('is_on_promotion', true);
            }

            if ($priceMin !== null) {
                $query->where(fn($q) => $q->where('price', '>=', $priceMin)
                    ->orWhere('promo_price', '>=', $priceMin));
            }
            if ($priceMax !== null) {
                $query->where(fn($q) => $q->where('price', '<=', $priceMax)
                    ->orWhere('promo_price', '<=', $priceMax));
            }

            return $query->latest()->paginate($params['per_page'] ?? 12);
        }

        $query = Product::active()->with(['mainVariant.mainImage']);

        collect($this->pipeline($params))
            ->filter(fn($filter) => $filter['active'])
            ->each(fn($filter) => $filter['apply']($query));

        return $query->latest()->paginate($params['per_page'] ?? 12);
    }

    private function pipeline(array $params): array
    {
        $priceMin = isset($params['price_min']) ? (float) $params['price_min'] : null;
        $priceMax = isset($params['price_max']) ? (float) $params['price_max'] : null;

        return [
            [
                'active' => !empty($params['categories']),
                'apply'  => fn(Builder $q) => $q->whereHas('categories', fn(Builder $c) =>
                    $c->whereIn('product_categories.id', $this->resolveCategoryIds($params['categories']))
                ),
            ],
            [
                'active' => !empty($params['dynamics']),
                'apply'  => fn(Builder $q) => $q->whereHas('dynamicCategories', fn(Builder $d) =>
                    $d->whereIn('dynamic_category_id', (array) $params['dynamics'])
                ),
            ],
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
        $selectedCategoryIds = (array) ($params['categories'] ?? []);

        // Caché para categorías, marcas y líneas de negocio (no cambian frecuentemente)
        $staticSidebar = Cache::remember('sidebar_static', 300, function () {
            $categories = ProductCategory::roots()->active()->get(['id', 'name', 'slug'])
                ->map(fn($item) => ['id' => $item->id, 'name' => $item->name, 'slug' => $item->slug, 'type' => 'standard']);

            $dynamics = DynamicCategory::where('is_active', true)->get(['id', 'name', 'slug'])
                ->map(fn($item) => ['id' => $item->id, 'name' => $item->name, 'slug' => $item->slug, 'type' => 'dynamic']);

            $brands = AttributesValue::whereHas('attribute', fn($q) =>
                $q->where('name', 'ILIKE', '%Marca%')
            )->get(['id', 'value as name'])
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