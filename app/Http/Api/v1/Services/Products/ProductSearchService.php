<?php

namespace App\Http\Api\v1\Services\Products;

use App\Models\Products\Product;
use App\Models\Products\ProductPack;
use App\Models\Products\ProductCategory;
use App\Models\Products\AttributesValue;
use App\Models\Products\BusinessLine;
use App\Models\Products\DynamicCategory;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ProductSearchService
{
    private const MIN_QUERY_LENGTH = 2;
    private const DEFAULT_LIMIT    = 6;

    public function getSuggestions(string $query, int $limit = self::DEFAULT_LIMIT): array
    {
        $q    = trim($query);
        $lowQ = mb_strtolower($q);

        if (mb_strlen($q) < self::MIN_QUERY_LENGTH) {
            return ['products' => [], 'suggestions' => []];
        }

        $products    = $this->fetchProductsRaw($q, $limit);
        $suggestions = $this->buildSuggestions($q, $lowQ, $limit);

        return [
            'products'    => $products->map(fn($p) => $this->formatProductResponse($p))->values(),
            'suggestions' => $suggestions->values()->take($limit),
        ];
    }

    // =========================================================================
    // Lógica de "Intención" (Smart Routing)
    // =========================================================================

    /**
     * Detecta si la búsqueda del usuario coincide exactamente con una entidad.
     * Esto permite "saltar" directo a la categoría/marca en lugar de buscar productos.
     */
    private function resolveSmartRedirect(string $q): string
    {
        $lowQ = mb_strtolower($q);

        // 1. Línea de Negocio
        $bl = BusinessLine::where('is_active', true)->whereRaw('LOWER(name) = ?', [$lowQ])->first();
        if ($bl) return "/productos?business_lines[]={$bl->slug}";

        // 2. Categoría (Standard)
        $cat = ProductCategory::active()->whereRaw('LOWER(name) = ?', [$lowQ])->first();
        if ($cat) {
            return $cat->parent_id 
                ? "/productos?categories[]={$cat->parent->slug}&subcategories[]={$cat->slug}"
                : "/productos?categories[]={$cat->slug}";
        }

        // 3. Marca (AttributeValue)
        $brand = AttributesValue::whereHas('attribute', fn($q) => $q->where('name', 'ILIKE', '%Marca%'))
            ->whereRaw('LOWER(value) = ?', [$lowQ])
            ->first();
        if ($brand) return "/productos?brands[]={$brand->id}";

        // Fallback: Búsqueda normal de texto
        return '/productos?q=' . urlencode($q);
    }

    // =========================================================================
    // Productos + Packs
    // =========================================================================

    private function fetchProductsRaw(string $q, int $limit): Collection
    {
        $products = Product::active()
            ->where(fn($query) =>
                $query->where('name', 'ILIKE', "%{$q}%")
                      ->orWhereHas('variants', fn($v) => $v->where('sku', 'ILIKE', "%{$q}%"))
            )
            ->with(['mainVariant.mainImage'])
            ->limit($limit)
            ->get();

        $packs = ProductPack::where('is_active', true)
            ->where('name', 'ILIKE', "%{$q}%")
            ->with('mainImage')
            ->limit(2)
            ->get();

        return $products->concat($packs)->take($limit);
    }

    // =========================================================================
    // Sugerencias
    // =========================================================================

    private function buildSuggestions(string $q, string $lowQ, int $limit): Collection
    {
        $entities = collect()
            ->concat($this->suggestCategories($q))
            ->concat($this->suggestBrands($q))
            ->concat($this->suggestBusinessLines($q))
            ->concat($this->suggestDynamics($q))
            ->unique(fn($item) => mb_strtolower($item['text']));

        // Si ya tenemos una sugerencia exacta (ej: el usuario escribió "Zapatillas" y existe la categoría),
        // no duplicamos la opción de búsqueda genérica al inicio.
        $hasExactMatch = $entities->contains(fn($item) => mb_strtolower($item['text']) === $lowQ);

        $head = $hasExactMatch
            ? collect()
            : collect([[
                'text' => $q,
                'url'  => $this->generalSearchUrl($q, $lowQ),
                'type' => 'query',
            ]]);

        return $head->concat($entities);
    }

    private function generalSearchUrl(string $q, string $lowQ): string
    {
        if (in_array($lowQ, ['pack', 'packs'])) {
            return '/productos?is_pack=true';
        }

        // Aquí usamos la lógica "God"
        return $this->resolveSmartRedirect($q);
    }

    // =========================================================================
    // Helpers de Búsqueda (Live Data)
    // =========================================================================

   private function suggestCategories(string $q): Collection
{
    return ProductCategory::active()
        ->where('name', 'ILIKE', "%{$q}%")
        ->with('parent:id,slug')
        
        ->orderByRaw('CASE 
            WHEN name ILIKE ? THEN 1    -- 1. Exact match (ej: "Papel")
            WHEN name ILIKE ? THEN 2    -- 2. Empieza con (ej: "Papel...")
            ELSE 3                      -- 3. Contiene en medio (ej: "Subcategoría Papel")
        END ASC', [$q, $q . '%'])
        ->orderByRaw('parent_id IS NULL DESC') 
        ->orderByRaw('LENGTH(name) ASC')      
        ->limit(3)
        ->get()
        ->map(fn($c) => [
            'text' => $c->name,
            'url'  => $c->parent_id
                ? "/productos?categories[]={$c->parent->slug}&subcategories[]={$c->slug}"
                : "/productos?categories[]={$c->slug}",
            'type' => 'category',
        ]);
}

    private function suggestBrands(string $q): Collection
    {
        return AttributesValue::whereHas('attribute', fn($query) => $query->where('name', 'ILIKE', '%Marca%'))
            ->where('value', 'ILIKE', "%{$q}%")
            ->limit(2)
            ->get()
            ->map(fn($b) => [
                'text' => $b->value,
                'url'  => "/productos?brands[]={$b->id}",
                'type' => 'brand',
            ]);
    }

    private function suggestBusinessLines(string $q): Collection
    {
        return BusinessLine::where('is_active', true)
            ->where('name', 'ILIKE', "%{$q}%")
            ->limit(2)
            ->get()
            ->map(fn($bl) => [
                'text' => $bl->name,
                'url'  => "/productos?business_lines[]={$bl->slug}",
                'type' => 'business_line',
            ]);
    }

    private function suggestDynamics(string $q): Collection
    {
        return DynamicCategory::where('is_active', true)
            ->where('name', 'ILIKE', "%{$q}%")
            ->limit(2)
            ->get()
            ->map(fn($d) => [
                'text' => $d->name,
                'url'  => "/productos?dynamics[]={$d->slug}",
                'type' => 'dynamic',
            ]);
    }

    // =========================================================================
    // Formato de respuesta (Formatting)
    // =========================================================================

    private function formatProductResponse(mixed $item): array
    {
        return $item instanceof ProductPack
            ? $this->formatPack($item)
            : $this->formatProduct($item);
    }

    private function formatPack(ProductPack $pack): array
    {
        return [
            'id'         => "pk-{$pack->id}",
            'name'       => $pack->name,
            'sku'        => 'PACK-' . $pack->id,
            'slug'       => $pack->slug,
            'price'      => (float) $pack->final_price,
            'is_promo'   => (bool) $pack->is_on_promotion,
            'image'      => $pack->mainImage?->file_path,
            'target_url' => "/packs/{$pack->slug}",
        ];
    }

    private function formatProduct(Product $product): array
    {
        $v = $product->mainVariant;
        $isPromo = $v?->is_on_promo
            && (!$v->promo_start_at || $v->promo_start_at->isPast())
            && (!$v->promo_end_at   || $v->promo_end_at->isFuture());

        return [
            'id'         => $product->id,
            'name'       => $product->name,
            'sku'        => $v?->sku,
            'slug'       => $product->slug,
            'price'      => (float) ($isPromo ? $v->promo_price : $v?->price),
            'is_promo'   => $isPromo,
            'image'      => $v?->mainImage?->file_path,
            'target_url' => "/producto/{$product->slug}",
        ];
    }
}