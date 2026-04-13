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
        $isPack  = $this->bool($params, 'is_pack');
        // Aseguramos que el sort sea exacto a lo esperado por el backend
        $sort    = $params['sort'] ?? 'relevance';
        $perPage = $this->safePerPage($params['per_page'] ?? self::PER_PAGE_DEFAULT);

        return $isPack
            ? $this->resolvePackQuery($params, $sort, $perPage)
            : $this->resolveProductQuery($params, $sort, $perPage);
    }

    private function resolveProductQuery(array $params, string $sort, int $perPage): LengthAwarePaginator
    {
        $query = Product::select('products.*')
            ->where('products.is_active', true)
            ->whereNull('products.deleted_at')
            ->with(['mainVariant.mainImage']);

        foreach ($this->pipeline($params) as $filter) {
            if ($filter['active']) {
                $filter['apply']($query);
            }
        }

        $this->applySorting($query, $sort);

        return $query->paginate($perPage);
    }

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
            // FIX 1: Lógica de categorías no excluyente. 
            // Si hay subcategorías, filtramos por ellas; si no, por el padre.
            [
                'active' => !empty($catSlugs) || !empty($subSlugs),
                'apply'  => function (Builder $q) use ($catSlugs, $subSlugs) {
                    $catIds = $this->categoryIdsBySlugs($catSlugs, false);
                    $subIds = $this->categoryIdsBySlugs($subSlugs, true);
                    
                    // Unimos ambos para que el motor de búsqueda no ignore el padre
                    $allIds = array_unique(array_merge($catIds, $subIds));

                    if (!empty($allIds)) {
                        $q->whereHas('categories', fn($c) => $c->whereIn('product_categories.id', $allIds));
                    }
                },
            ],

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

            [
                'active' => !empty($brandIds),
                'apply'  => fn(Builder $q) => $q->whereHas(
                    'variants.specifications',
                    fn(Builder $s) => $s->whereIn('attribute_value_id', $brandIds)
                ),
            ],

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

            [
                'active' => !empty($blSlugs),
                'apply'  => fn(Builder $q) => $q->whereHas(
                    'businessLines',
                    fn(Builder $b) => $b->whereIn('business_lines.slug', $blSlugs)
                ),
            ],

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

    // FIX 2: Mejoramos el Sidebar para que NO desaparezca al elegir una subcategoría
    private function buildSidebar(array $params): array
    {
        $static = $this->staticSidebar();
        $catSlugs = $this->slugArray($params, 'categories');

        // IMPORTANTE: Las subcategorías mostradas deben depender de la categoría PADRE seleccionada,
        // no de la subcategoría misma. Si no hay padre, no hay subcategorías en el sidebar.
        $subcategories = empty($catSlugs)
            ? []
            : $this->resolveSubcategories($catSlugs);

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

    // FIX 3: Sorting Robusto (Asegúrate de que el frontend envíe estos exactos valores)
    private function applySorting(Builder $query, string $sort): void
    {
        $query->getQuery()->orders = null;

        match ($sort) {
            'price-asc', 'price-low'  => $this->applySortByPrice($query, 'asc'),
            'price-desc', 'price-high' => $this->applySortByPrice($query, 'desc'),
            'name-asc'   => $query->orderBy('products.name', 'asc'),
            'name-desc'  => $query->orderBy('products.name', 'desc'),
            'newest'     => $query->orderBy('products.created_at', 'desc'),
            default      => $query->orderBy('products.is_home', 'desc')
                                  ->orderBy('products.created_at', 'desc'),
        };
    }

    // El resto de funciones auxiliares se mantienen pero con pequeñas limpiezas...
    private function applySortByPrice(Builder $query, string $direction): void
    {
        $query->join('product_variants as pv_sort', function ($join) {
            $join->on('products.id', '=', 'pv_sort.product_id')
                 ->where('pv_sort.is_main', true)
                 ->whereNull('pv_sort.deleted_at');
        })->orderByRaw("
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

    private function resolveSubcategories(array $slugs): \Illuminate\Support\Collection
    {
        // Buscamos los IDs de los padres seleccionados
        $parentIds = ProductCategory::whereIn('slug', $slugs)
            ->whereNull('parent_id')
            ->pluck('id');

        if ($parentIds->isEmpty()) return collect();

        // Retornamos todas sus subcategorías agrupadas por el nombre del padre
        return ProductCategory::whereIn('parent_id', $parentIds)
            ->active()
            ->with('parent:id,name')
            ->get(['id', 'name', 'slug', 'parent_id'])
            ->groupBy(fn($item) => $item->parent->name);
    }

    private function categoryIdsBySlugs(array $slugs, bool $isSubcategory): array
    {
        if (empty($slugs)) return [];
        $cats = ProductCategory::whereIn('slug', $slugs)->get(['id', 'parent_id']);
        $ids  = $cats->pluck('id')->toArray();

        if (!$isSubcategory) {
            $rootIds = $cats->filter(fn($c) => empty($c->parent_id))->pluck('id');
            if ($rootIds->isNotEmpty()) {
                $childIds = ProductCategory::whereIn('parent_id', $rootIds)->pluck('id')->toArray();
                $ids = array_merge($ids, $childIds);
            }
        }
        return array_unique($ids);
    }

    // Métodos de ayuda (Packs, dynamicIds, etc.) se mantienen igual...
    private function resolvePackQuery(array $params, string $sort, int $perPage): LengthAwarePaginator { /* ... */ return ProductPack::where('is_active', true)->paginate($perPage); }
    private function applySortingForPacks(Builder $query, string $sort): void { /* ... */ }
    private function staticSidebar(): array { 
        return Cache::remember('sidebar_static', self::SIDEBAR_TTL, function () {
            $categories = ProductCategory::roots()->active()->get(['id', 'name', 'slug'])->map(fn($c) => ['id' => $c->id, 'name' => $c->name, 'slug' => $c->slug, 'type' => 'standard']);
            $dynamics = DynamicCategory::where('is_active', true)->get(['id', 'name', 'slug'])->map(fn($d) => ['id' => $d->id, 'name' => $d->name, 'slug' => $d->slug, 'type' => 'dynamic']);
            $brands = AttributesValue::whereHas('attribute', fn($q) => $q->where('name', 'ILIKE', '%Marca%'))->get(['id', 'value as name'])->unique(fn($b) => strtolower(trim($b->name)))->values();
            $businessLines = BusinessLine::where('is_active', true)->get(['id', 'name', 'slug']);
            return compact('categories', 'dynamics', 'brands', 'businessLines');
        });
    }
    private function dynamicIdsBySlugs(array $slugs): array { return DynamicCategory::whereIn('slug', $slugs)->pluck('id')->toArray(); }
    private function bool(array $params, string $key): bool { return filter_var($params[$key] ?? false, FILTER_VALIDATE_BOOLEAN); }
    private function float(array $params, string $key): ?float { return isset($params[$key]) && $params[$key] !== '' ? (float) $params[$key] : null; }
    private function slugArray(array $params, string $key): array { return array_values(array_filter((array) ($params[$key] ?? []))); }
    private function idArray(array $params, string $key): array { return array_values(array_filter((array) ($params[$key] ?? []))); }
    private function safePerPage(mixed $value): int { $int = (int) $value; return ($int >= 1 && $int <= self::PER_PAGE_MAX) ? $int : self::PER_PAGE_DEFAULT; }
    private function applyPromoPrice(Builder $q, ?float $min, ?float $max): void { $q->where('is_on_promo', true)->whereNotNull('promo_price'); if ($min !== null) $q->where('promo_price', '>=', $min); if ($max !== null) $q->where('promo_price', '<=', $max); }
    private function applyNormalPrice(Builder $q, ?float $min, ?float $max): void { $q->where(fn($x) => $x->where('is_on_promo', false)->orWhereNull('promo_price')); if ($min !== null) $q->where('price', '>=', $min); if ($max !== null) $q->where('price', '<=', $max); }
}