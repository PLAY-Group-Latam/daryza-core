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
    private const PER_PAGE_DEFAULT = 12;
    private const PER_PAGE_MAX     = 48;
    private const SIDEBAR_TTL      = 300;

    // =========================================================================
    // Entrypoint
    // =========================================================================

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

    // =========================================================================
    // Resolución principal
    // =========================================================================

    private function resolveItems(array $params): LengthAwarePaginator
    {
        $isPack  = $this->bool($params, 'is_pack');
        $sort    = $params['sort'] ?? 'relevance';
        $perPage = $this->safePerPage($params['per_page'] ?? self::PER_PAGE_DEFAULT);

        return $isPack
            ? $this->resolvePackQuery($params, $sort, $perPage)
            : $this->resolveProductQuery($params, $sort, $perPage);
    }

    // =========================================================================
    // Query — Packs
    // =========================================================================

    private function resolvePackQuery(array $params, string $sort, int $perPage): LengthAwarePaginator
    {
        $priceMin = $this->float($params, 'price_min');
        $priceMax = $this->float($params, 'price_max');

        $query = ProductPack::where('is_active', true)->with('mainImage');

        if ($this->bool($params, 'on_offer')) {
            $query->where('is_on_promotion', true);
        }

        if ($priceMin !== null) {
            $query->where(fn($q) => $q->where('price', '>=', $priceMin)->orWhere('promo_price', '>=', $priceMin));
        }

        if ($priceMax !== null) {
            $query->where(fn($q) => $q->where('price', '<=', $priceMax)->orWhere('promo_price', '<=', $priceMax));
        }

        $this->applySortingForPacks($query, $sort);

        return $query->paginate($perPage);
    }

    // =========================================================================
    // Query — Productos
    // =========================================================================

private function resolveProductQuery(array $params, string $sort, int $perPage): LengthAwarePaginator
{
    // 1. Iniciamos la query con select explícito para evitar colisión de IDs
    $query = Product::select('products.*')
        ->where('products.is_active', true)
        ->whereNull('products.deleted_at')
        ->with(['mainVariant.mainImage']);

    // 2. Aplicamos el Pipeline de filtros
    foreach ($this->pipeline($params) as $filter) {
        if ($filter['active']) {
            $filter['apply']($query);
        }
    }

    // 3. Aplicamos el Sorting (Orden Global)
    $this->applySorting($query, $sort);

    return $query->paginate($perPage);
}

    // =========================================================================
    // Pipeline de filtros
    // =========================================================================

    private function pipeline(array $params): array
    {
        $priceMin  = $this->float($params, 'price_min');
        $priceMax  = $this->float($params, 'price_max');
        $catSlugs  = $this->slugArray($params, 'categories');
        $subSlugs  = $this->slugArray($params, 'subcategories');
        $dynSlugs  = $this->slugArray($params, 'dynamics');
        $brandIds  = $this->idArray($params, 'brands');
        $blSlugs   = $this->slugArray($params, 'business_lines');

        return [

            // --- Categorías / Subcategorías ---
            [
                'active' => !empty($catSlugs) || !empty($subSlugs),
                'apply'  => function (Builder $q) use ($catSlugs, $subSlugs) {
                    $ids = !empty($subSlugs)
                        ? $this->categoryIdsBySlugs($subSlugs, isSubcategory: true)
                        : $this->categoryIdsBySlugs($catSlugs, isSubcategory: false);

                    if (!empty($ids)) {
                        $q->whereHas('categories', fn($c) => $c->whereIn('product_categories.id', $ids));
                    }
                },
            ],

            // --- Categorías dinámicas ---
            [
                'active' => !empty($dynSlugs),
                'apply'  => function (Builder $q) use ($dynSlugs) {
                    $ids = $this->dynamicIdsBySlugs($dynSlugs);
                    if (!empty($ids)) {
                        $q->whereExists(fn($sub) =>
                            $sub->selectRaw(1)
                                ->from('dynamic_category_items')
                                ->whereColumn('dynamic_category_items.product_id', 'products.id')
                                ->whereIn('dynamic_category_id', $ids)
                        );
                    }
                },
            ],

            // --- Marcas (por ID de AttributesValue) ---
            [
                'active' => !empty($brandIds),
                'apply'  => fn(Builder $q) => $q->whereHas(
                    'variants.specifications',
                    fn(Builder $s) => $s->whereIn('attribute_value_id', $brandIds)
                ),
            ],

// --- Ofertas ---
[
    'active' => $this->bool($params, 'on_offer'),
    'apply'  => fn(Builder $q) => $q->whereHas(
        'mainVariant',
        fn(Builder $v) => $v->onPromo()
                            ->whereNotNull('promo_price')
                            ->where(fn($d) => $d->whereNull('promo_start_at')->orWhere('promo_start_at', '<=', now()))
                            ->where(fn($d) => $d->whereNull('promo_end_at')->orWhere('promo_end_at', '>=', now()))
    ),
],

            // --- Líneas de negocio (por slug) ---
            [
                'active' => !empty($blSlugs),
                'apply'  => fn(Builder $q) => $q->whereHas(
                    'businessLines',
                    fn(Builder $b) => $b->whereIn('business_lines.slug', $blSlugs)
                ),
            ],

            // --- Rango de precio (sobre mainVariant, respeta promo activa) ---
            [
                'active' => $priceMin !== null || $priceMax !== null,
                'apply'  => fn(Builder $q) => $q->whereHas(
                    'mainVariant',
                    fn(Builder $v) => $v->where(fn($sub) =>
                        $sub->where(fn($promo) => $this->applyPromoPrice($promo, $priceMin, $priceMax))
                            ->orWhere(fn($normal) => $this->applyNormalPrice($normal, $priceMin, $priceMax))
                    )
                ),
            ],
        ];
    }

    // =========================================================================
    // Helpers de precio
    // =========================================================================

    private function applyPromoPrice(Builder $q, ?float $min, ?float $max): void
    {
        $q->where('is_on_promo', true)->whereNotNull('promo_price');
        if ($min !== null) $q->where('promo_price', '>=', $min);
        if ($max !== null) $q->where('promo_price', '<=', $max);
    }

    private function applyNormalPrice(Builder $q, ?float $min, ?float $max): void
    {
        $q->where(fn($x) => $x->where('is_on_promo', false)->orWhereNull('promo_price'));
        if ($min !== null) $q->where('price', '>=', $min);
        if ($max !== null) $q->where('price', '<=', $max);
    }

    // =========================================================================
    // Sorting — Productos
    // =========================================================================

    private function applySorting(Builder $query, string $sort): void
{
    // Limpiamos órdenes previos (como el is_home por defecto) para que el sort del usuario mande
    $query->getQuery()->orders = null;

    match ($sort) {
        'price-low'  => $this->applySortByPrice($query, 'asc'),
        'price-high' => $this->applySortByPrice($query, 'desc'),
        'name-asc'   => $query->orderBy('products.name', 'asc'),
        'name-desc'  => $query->orderBy('products.name', 'desc'),
        'newest'     => $query->orderBy('products.created_at', 'desc'),
        // Por defecto: Home primero, luego los más nuevos
        default      => $query->orderBy('products.is_home', 'desc')
                              ->orderBy('products.created_at', 'desc'),
    };
}

private function applySortByPrice(Builder $query, string $direction): void
{
    // Join con la variante principal para ordenar por el precio real
    $query->join('product_variants as pv_sort', function ($join) {
        $join->on('products.id', '=', 'pv_sort.product_id')
             ->where('pv_sort.is_main', true)
             ->whereNull('pv_sort.deleted_at');
    })
    // COALESCE maneja si debe usar precio de promo o normal
    ->orderByRaw("
        CASE 
            WHEN pv_sort.is_on_promo = true 
                 AND pv_sort.promo_price IS NOT NULL 
                 AND (pv_sort.promo_start_at IS NULL OR pv_sort.promo_start_at <= NOW())
                 AND (pv_sort.promo_end_at IS NULL OR pv_sort.promo_end_at >= NOW())
            THEN pv_sort.promo_price 
            ELSE pv_sort.price 
        END {$direction}
    ");
}

    // =========================================================================
    // Sorting — Packs
    // =========================================================================

    private function applySortingForPacks(Builder $query, string $sort): void
    {
        match ($sort) {
            'price-low'  => $query->orderBy('price', 'asc'),
            'price-high' => $query->orderBy('price', 'desc'),
            'name-asc'   => $query->orderBy('name', 'asc'),
            'name-desc'  => $query->orderBy('name', 'desc'),
            default      => $query->latest(),
        };
    }

    // =========================================================================
    // Sidebar
    // =========================================================================

    private function buildSidebar(array $params): array
    {
        $static = $this->staticSidebar();

        $subSlugs = $this->slugArray($params, 'subcategories');
        $catSlugs = $this->slugArray($params, 'categories');
        $lookupSlugs = !empty($subSlugs) ? $subSlugs : $catSlugs;

        $subcategories = empty($lookupSlugs)
            ? []
            : $this->resolveSubcategories($lookupSlugs);

        return [
            'categories'     => $static['categories']->concat($static['dynamics']),
            'subcategories'  => $subcategories,
            'brands'         => $static['brands'],
            'business_lines' => $static['businessLines'],
            'specials'       => [
                ['id' => 'packs',  'name' => 'Packs',                 'key' => 'is_pack'],
                ['id' => 'offers', 'name' => 'Ofertas y Promociones', 'key' => 'on_offer'],
            ],
        ];
    }

    private function staticSidebar(): array
    {
        return Cache::remember('sidebar_static', self::SIDEBAR_TTL, function () {
            $categories = ProductCategory::roots()->active()
                ->get(['id', 'name', 'slug'])
                ->map(fn($c) => ['id' => $c->id, 'name' => $c->name, 'slug' => $c->slug, 'type' => 'standard']);

            $dynamics = DynamicCategory::where('is_active', true)
                ->get(['id', 'name', 'slug'])
                ->map(fn($d) => ['id' => $d->id, 'name' => $d->name, 'slug' => $d->slug, 'type' => 'dynamic']);

            $brands = AttributesValue::whereHas('attribute', fn($q) => $q->where('name', 'ILIKE', '%Marca%'))
                ->get(['id', 'value as name'])
                ->unique(fn($b) => strtolower(trim($b->name)))
                ->values();

            $businessLines = BusinessLine::where('is_active', true)->get(['id', 'name', 'slug']);

            return compact('categories', 'dynamics', 'brands', 'businessLines');
        });
    }

    private function resolveSubcategories(array $slugs): \Illuminate\Support\Collection
    {
        $parentIds = ProductCategory::whereIn('slug', $slugs)
            ->whereNull('parent_id')
            ->pluck('id');

        if ($parentIds->isEmpty()) return collect();

        return ProductCategory::whereIn('parent_id', $parentIds)
            ->active()
            ->with('parent:id,name')
            ->get(['id', 'name', 'slug', 'parent_id'])
            ->groupBy(fn($item) => $item->parent->name);
    }

    // =========================================================================
    // Resolvers slug → ID (1 query cada uno, sin N+1)
    // =========================================================================

    private function categoryIdsBySlugs(array $slugs, bool $isSubcategory): array
    {
        if (empty($slugs)) return [];

        $cats = ProductCategory::whereIn('slug', $slugs)->get(['id', 'parent_id']);
        $ids  = $cats->pluck('id')->toArray();

        // Si es categoría root, incluir también todos sus hijos en una sola query
        if (!$isSubcategory) {
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
        if (empty($slugs)) return [];
        return DynamicCategory::whereIn('slug', $slugs)->pluck('id')->toArray();
    }

    // =========================================================================
    // Helpers de parseo de params
    // =========================================================================

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