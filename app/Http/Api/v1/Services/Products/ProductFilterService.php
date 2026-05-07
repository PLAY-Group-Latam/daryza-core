<?php

namespace App\Http\Api\v1\Services\Products;

use App\Models\Products\Product;
use App\Models\Products\ProductPack;
use App\Models\Products\ProductCategory;
use App\Models\Products\DynamicCategory;
use App\Models\Products\BusinessLine;
use App\Models\Products\AttributesValue;
use App\Models\Products\Brand;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class ProductFilterService
{
    private const PER_PAGE_DEFAULT = 12;
    private const PER_PAGE_MAX     = 48;
    private const SIDEBAR_CACHE_KEY = 'sidebar_static_data';

    public function applyFilters(array $params): array
    {
        $results = $this->resolveItems($params);

        $nextPage = $results->currentPage() < $results->lastPage()
            ? $results->currentPage() + 1
            : null;

        return [
            'items'      => $results->items(),
            'sidebar'    => $this->buildSidebar($params),
            'pagination' => [
                'total'        => $results->total(),
                'current_page' => $results->currentPage(),
                'last_page'    => $results->lastPage(),
                'per_page'     => $results->perPage(),
                'next_cursor'  => $nextPage,
            ],
        ];
    }

    private function resolveItems(array $params): LengthAwarePaginator
    {
        $isPack  = $this->bool($params, 'is_pack');
        $sort    = $params['sort'] ?? 'relevance';
        $perPage = $this->safePerPage($params['per_page'] ?? self::PER_PAGE_DEFAULT);

        return $isPack
            ? $this->resolvePackQuery($params, $sort, $perPage)
            : $this->resolveProductQuery($params, $sort, $perPage);
    }

    // -------------------------------------------------------------------------
    // PRODUCTS
    // -------------------------------------------------------------------------

    private function resolveProductQuery(array $params, string $sort, int $perPage): LengthAwarePaginator
    {
        $needsPriceSort = in_array($sort, ['price-asc', 'price-low', 'price-desc', 'price-high']);
        $direction      = in_array($sort, ['price-desc', 'price-high']) ? 'desc' : 'asc';

        $query = Product::query()
            ->where('products.is_active', true)
            ->whereNull('products.deleted_at')
            ->with(['mainVariant.mainImage']);

        if ($needsPriceSort) {

            $query->selectRaw('products.*')
                ->selectSub(
                    DB::table('product_variants as pv')
                        ->selectRaw("
                            CASE
                                WHEN pv.is_on_promo = true
                                     AND pv.promo_price IS NOT NULL
                                     AND (pv.promo_start_at IS NULL OR pv.promo_start_at <= NOW())
                                     AND (pv.promo_end_at   IS NULL OR pv.promo_end_at   >= NOW())
                                THEN pv.promo_price
                                ELSE pv.price
                            END
                        ")
                        ->whereColumn('pv.product_id', 'products.id')
                        ->where('pv.is_main', true)
                        ->where('pv.is_active', true)
                        ->whereNull('pv.deleted_at')
                        ->limit(1),
                    'effective_price'
                )
                ->distinct();
        } else {
            $query->select('products.*')->distinct();
        }

        foreach ($this->pipeline($params) as $filter) {
            if ($filter['active']) {
                $filter['apply']($query);
            }
        }

        $this->applySorting($query, $sort, $direction);

        return $query->paginate($perPage);
    }

    private function applySorting(Builder $query, string $sort, string $direction = 'asc'): void
    {
        $query->getQuery()->orders = null;

        match ($sort) {
            'price-asc', 'price-low',
            'price-desc', 'price-high' => $query->orderBy('effective_price', $direction)
                ->orderBy('products.id', $direction),
            'name-asc'                 => $query->orderBy('products.name', 'asc')
                ->orderBy('products.id', 'asc'),
            'name-desc'                => $query->orderBy('products.name', 'desc')
                ->orderBy('products.id', 'desc'),
            'newest'                   => $query->orderBy('products.created_at', 'desc'),
            default                    => $query->orderBy('products.is_home', 'desc')
                ->orderBy('products.created_at', 'desc'),
        };
    }

    // -------------------------------------------------------------------------
    // PACKS
    // -------------------------------------------------------------------------

    private function resolvePackQuery(array $params, string $sort, int $perPage): LengthAwarePaginator
    {
        $priceMin = $this->float($params, 'price_min');
        $priceMax = $this->float($params, 'price_max');

        $query = ProductPack::query()->where('is_active', true);

        if ($this->bool($params, 'on_offer')) {
            $query->where('is_on_promotion', true)
                ->whereNotNull('promo_price')
                ->where(fn($q) => $q->whereNull('promo_start_at')->orWhere('promo_start_at', '<=', now()))
                ->where(fn($q) => $q->whereNull('promo_end_at')->orWhere('promo_end_at', '>=', now()));
        }

        if ($priceMin !== null || $priceMax !== null) {
            $query->where(function (Builder $q) use ($priceMin, $priceMax) {
                // Rama promo activa
                $q->where(function (Builder $promo) use ($priceMin, $priceMax) {
                    $promo->where('is_on_promotion', true)
                        ->whereNotNull('promo_price')
                        ->where(fn($d) => $d->whereNull('promo_start_at')->orWhere('promo_start_at', '<=', now()))
                        ->where(fn($d) => $d->whereNull('promo_end_at')->orWhere('promo_end_at', '>=', now()));
                    if ($priceMin !== null) $promo->where('promo_price', '>=', $priceMin);
                    if ($priceMax !== null) $promo->where('promo_price', '<=', $priceMax);
                })
                    // Rama precio normal
                    ->orWhere(function (Builder $normal) use ($priceMin, $priceMax) {
                        $normal->where(fn($x) => $x->where('is_on_promotion', false)->orWhereNull('promo_price'));
                        if ($priceMin !== null) $normal->where('price', '>=', $priceMin);
                        if ($priceMax !== null) $normal->where('price', '<=', $priceMax);
                    });
            });
        }

        $this->applySortToPack($query, $sort);

        return $query->paginate($perPage);
    }

    private function applySortToPack(Builder $query, string $sort): void
    {
        $query->getQuery()->orders = null;

        $direction = (str_contains($sort, 'desc') || $sort === 'price-high') ? 'desc' : 'asc';

        match ($sort) {
            'price-asc', 'price-low',
            'price-desc', 'price-high' => $this->applyPackSortByPrice($query, $direction),
            'name-asc'                 => $query->orderBy('name', 'asc'),
            'name-desc'                => $query->orderBy('name', 'desc'),
            'newest'                   => $query->orderBy('created_at', 'desc'),
            default                    => $query->orderBy('show_on_home', 'desc')
                ->orderBy('created_at', 'desc'),
        };
    }

    /**
     * Packs: el precio efectivo está en la propia tabla product_packs,
     * sin necesidad de JOIN. Usamos whenColumn-style con el builder
     * a través de orderByRaw con bindings para evitar SQL literal embebido.
     */
    private function applyPackSortByPrice(Builder $query, string $direction): void
    {
        $now = now();

        $query->orderByRaw("
            CASE
                WHEN is_on_promotion = true
                     AND promo_price IS NOT NULL
                     AND (promo_start_at IS NULL OR promo_start_at <= ?)
                     AND (promo_end_at   IS NULL OR promo_end_at   >= ?)
                THEN promo_price
                ELSE price
            END {$direction}
        ", [$now, $now]);
    }

    // -------------------------------------------------------------------------
    // PIPELINE DE FILTROS (productos)
    // -------------------------------------------------------------------------

    private function pipeline(array $params): array
    {
        $priceMin = $this->float($params, 'price_min');
        $priceMax = $this->float($params, 'price_max');
        $catSlugs = $this->slugArray($params, 'categories');
        $subSlugs = $this->slugArray($params, 'subcategories');
        $dynSlugs = $this->slugArray($params, 'dynamics');
        $brandSlugs = $this->slugArray($params, 'brands');
        $blSlugs  = $this->slugArray($params, 'business_lines');

        return [
            'categories_and_subs' => [
                'active' => !empty($catSlugs) || !empty($subSlugs),
                'apply'  => function (Builder $q) use ($catSlugs, $subSlugs) {
                    if (!empty($catSlugs) && empty($subSlugs)) {
                        $catIds = $this->categoryIdsBySlugs($catSlugs, false, false);
                        if (!empty($catIds)) {
                            $q->whereHas('categories', fn($c) => $c->whereIn('product_categories.id', $catIds));
                        }
                        return;
                    }
                    if (!empty($subSlugs)) {
                        $subIds = $this->categoryIdsBySlugs($subSlugs, true);
                        if (!empty($catSlugs)) {
                            $parentIds = ProductCategory::whereIn('slug', $catSlugs)
                                ->whereNull('parent_id')
                                ->pluck('id');
                            $subIds = ProductCategory::whereIn('id', $subIds)
                                ->whereIn('parent_id', $parentIds)
                                ->pluck('id')
                                ->toArray();
                        }
                        if (!empty($subIds)) {
                            $q->whereHas('categories', fn($c) => $c->whereIn('product_categories.id', $subIds));
                        }
                    }
                },
            ],

            'dynamics' => [
                'active' => !empty($dynSlugs),
                'apply'  => function (Builder $q) use ($dynSlugs) {
                    $ids = $this->dynamicIdsBySlugs($dynSlugs);
                    if (empty($ids)) {
                        $q->whereRaw('1 = 0');
                        return;
                    }
                    $q->whereHas(
                        'dynamicCategories',
                        fn($d) =>
                        $d->activeNow()->whereIn('dynamic_categories.id', $ids)
                    );
                },
            ],

       'brands' => [
    'active' => !empty($brandSlugs),
    'apply'  => fn(Builder $q) => $q->whereHas(
        'brand',
        fn(Builder $b) => $b->whereIn('brands.slug', $brandSlugs)
    ),
],

            'offers' => [
                'active' => $this->bool($params, 'on_offer'),
                'apply'  => fn(Builder $q) => $q->whereHas(
                    'mainVariant',
                    fn(Builder $v) =>
                    $v->where('is_on_promo', true)
                        ->whereNotNull('promo_price')
                        ->where(fn($d) => $d->whereNull('promo_start_at')->orWhere('promo_start_at', '<=', now()))
                        ->where(fn($d) => $d->whereNull('promo_end_at')->orWhere('promo_end_at', '>=', now()))
                ),
            ],

            'business_lines' => [
                'active' => !empty($blSlugs),
                'apply'  => fn(Builder $q) => $q->whereHas(
                    'businessLines',
                    fn(Builder $b) => $b->whereIn('business_lines.slug', $blSlugs)
                ),
            ],

            'price_range' => [
                'active' => $priceMin !== null || $priceMax !== null,
                'apply'  => fn(Builder $q) => $q->whereHas(
                    'mainVariant',
                    fn(Builder $v) => $v->where(
                        fn($sub) =>
                        $sub->where(fn($promo) => $this->applyPromoPrice($promo, $priceMin, $priceMax))
                            ->orWhere(fn($normal) => $this->applyNormalPrice($normal, $priceMin, $priceMax))
                    )
                ),
            ],
        ];
    }

    // -------------------------------------------------------------------------
    // SIDEBAR
    // -------------------------------------------------------------------------

    private function buildSidebar(array $params): array
    {
        $static   = $this->staticSidebar();
        $catSlugs = $this->slugArray($params, 'categories');

        return [
            'categories'     => $static['categories'],
            'subcategories'  => empty($catSlugs) ? [] : $this->resolveSubcategories($catSlugs),
            'brands'         => $static['brands'],
            'business_lines' => $static['businessLines'],
            'specials'       => [
                ['id' => 'packs',  'name' => 'Packs',                'key' => 'is_pack'],
                ['id' => 'offers', 'name' => 'Ofertas y Promociones', 'key' => 'on_offer'],
            ],
        ];
    }

    private function staticSidebar(): array
    {
        return Cache::remember(self::SIDEBAR_CACHE_KEY, $this->nextDynamicExpiry(), function () {
            $categories = ProductCategory::roots()->active()
                ->get(['id', 'name', 'slug'])
                ->map(fn($c) => ['id' => $c->id, 'name' => $c->name, 'slug' => $c->slug, 'type' => 'category']);

            $dynamics = DynamicCategory::activeNow()
                ->get(['id', 'name', 'slug'])
                ->map(fn($d) => ['id' => $d->id, 'name' => $d->name, 'slug' => $d->slug, 'type' => 'dynamic']);

            return [
                'categories'    => $categories->concat($dynamics),
                'brands'        => $this->getNormalizedBrands(),
                'businessLines' => BusinessLine::where('is_active', true)->get(['id', 'name', 'slug']),
            ];
        });
    }

    private function nextDynamicExpiry(): \Carbon\Carbon
    {
        $next = DynamicCategory::activeNow()
            ->whereNotNull('ends_at')
            ->orderBy('ends_at', 'asc')
            ->value('ends_at');

        return $next ?? now()->addHours(6);
    }

private function getNormalizedBrands()
{
    return Brand::where('is_active', true)
        ->orderBy('name')
        ->get(['id', 'name', 'slug'])
        ->map(fn($brand) => [
            'id'   => $brand->slug,  
            'name' => $brand->name,
            'slug' => $brand->slug,
            'type' => 'brand',
        ])
        ->values();
}

    private function resolveSubcategories(array $slugs): \Illuminate\Support\Collection
    {
        $parentIds = ProductCategory::whereIn('slug', $slugs)->whereNull('parent_id')->pluck('id');
        if ($parentIds->isEmpty()) return collect();

        return ProductCategory::whereIn('parent_id', $parentIds)
            ->active()
            ->with('parent:id,name')
            ->get(['id', 'name', 'slug', 'parent_id'])
            ->groupBy(fn($item) => $item->parent->name);
    }

    // -------------------------------------------------------------------------
    // HELPERS
    // -------------------------------------------------------------------------

    private function categoryIdsBySlugs(array $slugs, bool $isSubcategory, bool $strict = false): array
    {
        if (empty($slugs)) return [];

        $cats = ProductCategory::whereIn('slug', $slugs)->get(['id', 'parent_id']);
        $ids  = $cats->pluck('id')->toArray();

        if (!$isSubcategory && !$strict) {
            $rootIds = $cats->filter(fn($c) => empty($c->parent_id))->pluck('id');
            if ($rootIds->isNotEmpty()) {
                $childIds = ProductCategory::whereIn('parent_id', $rootIds)->pluck('id')->toArray();
                $ids = array_merge($ids, $childIds);
            }
        }

        return array_unique($ids);
    }

    private function dynamicIdsBySlugs(array $slugs): array
    {
        return DynamicCategory::whereIn('slug', $slugs)
            ->activeNow()
            ->pluck('id')
            ->toArray();
    }

    private function applyPromoPrice(Builder $q, ?float $min, ?float $max): void
    {
        $q->where('is_on_promo', true)
            ->whereNotNull('promo_price')
            ->where(fn($d) => $d->whereNull('promo_start_at')->orWhere('promo_start_at', '<=', now()))
            ->where(fn($d) => $d->whereNull('promo_end_at')->orWhere('promo_end_at', '>=', now()));
        if ($min !== null) $q->where('promo_price', '>=', $min);
        if ($max !== null) $q->where('promo_price', '<=', $max);
    }

    private function applyNormalPrice(Builder $q, ?float $min, ?float $max): void
    {
        $q->where(fn($x) => $x->where('is_on_promo', false)->orWhereNull('promo_price'));
        if ($min !== null) $q->where('price', '>=', $min);
        if ($max !== null) $q->where('price', '<=', $max);
    }

    private function bool(array $params, string $key): bool
    {
        return filter_var($params[$key] ?? false, FILTER_VALIDATE_BOOLEAN);
    }

    private function float(array $params, string $key): ?float
    {
        return isset($params[$key]) && $params[$key] !== '' ? (float) $params[$key] : null;
    }

    private function slugArray(array $params, string $key): array
    {
        return array_values(array_filter((array) ($params[$key] ?? [])));
    }

    private function idArray(array $params, string $key): array
    {
        return array_values(array_filter((array) ($params[$key] ?? [])));
    }

    private function safePerPage(mixed $value): int
    {
        $int = (int) $value;
        return ($int >= 1 && $int <= self::PER_PAGE_MAX) ? $int : self::PER_PAGE_DEFAULT;
    }
}
