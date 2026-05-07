<?php

namespace App\Http\Api\v1\Services\Products;

use App\Models\Products\Product;
use App\Models\Products\ProductPack;
use App\Models\Products\ProductCategory;
use App\Models\Products\BusinessLine;
use App\Models\Products\Brand;
use App\Models\Products\DynamicCategory;
use Illuminate\Support\Collection;

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

        // 3. Marca
        $brand = Brand::where('is_active', true)->whereRaw('LOWER(name) = ?', [$lowQ])->first();
        if ($brand) return "/productos?brands[]={$brand->slug}";

        // Fallback
        return '/productos?q=' . urlencode($q);
    }

  private function sanitizeQuery(string $q): string
{
    // Permitir números para que el SKU no sea ignorado
    $clean = preg_replace('/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]/u', '', $q);
    return trim($clean);
}

    private function fetchProductsRaw(string $q, int $limit): Collection
{
    $qClean = $this->sanitizeQuery($q);

    // 1. PRIORIDAD MÁXIMA: Coincidencia exacta de SKU
    $productBySku = Product::active()
        ->whereHas('variants', fn($v) => $v->where('sku', 'ILIKE', $q))
        ->with(['mainVariant.mainImage'])
        ->get();

    if ($productBySku->isNotEmpty()) {
        return $productBySku; // Si es SKU, devolvemos solo esto (relevancia total)
    }

    // 2. PRODUCTOS por nombre (Query original y limpia)
    $products = Product::active()
        ->where(fn($query) =>
            $query->where('name', 'ILIKE', "%{$q}%")
                  ->orWhere('name', 'ILIKE', "%{$qClean}%")
        )
        ->with(['mainVariant.mainImage'])
        ->limit($limit)
        ->get();

    // 3. PACKS (Solo si aún hay espacio en el limite)
    $remainingLimit = $limit - $products->count();
    $packs = collect();
    
    if ($remainingLimit > 0) {
        $packs = ProductPack::where('is_active', true)
            ->where(fn($query) =>
                $query->where('name', 'ILIKE', "%{$q}%")
                      ->orWhere('name', 'ILIKE', "%{$qClean}%")
            )
            ->with('mainImage')
            ->limit($remainingLimit)
            ->get();
    }

    return $products->concat($packs)->take($limit);
}

    private function buildSuggestions(string $q, string $lowQ, int $limit): Collection
    {
        $entities = collect()
            ->concat($this->suggestCategories($q))
            ->concat($this->suggestBrands($q))
            ->concat($this->suggestBusinessLines($q))
            ->concat($this->suggestDynamics($q)) // Aquí ya usa el scope ActiveNow
            ->unique(fn($item) => mb_strtolower($item['text']));

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
        return $this->resolveSmartRedirect($q);
    }

    // Sugerencias de Entidades con validación de vigencia
    private function suggestCategories(string $q): Collection
    {
        $qClean = $this->sanitizeQuery($q);
        return ProductCategory::active()
            ->where(fn($query) =>
                $query->where('name', 'ILIKE', "%{$q}%")
                      ->orWhere('name', 'ILIKE', "%{$qClean}%")
            )
            ->with('parent:id,slug')
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
        $qClean = $this->sanitizeQuery($q);
        return Brand::where('is_active', true)
            ->where(fn($query) =>
                $query->where('name', 'ILIKE', "%{$q}%")
                      ->orWhere('name', 'ILIKE', "%{$qClean}%")
            )
            ->limit(3)
            ->get()
            ->map(fn($b) => [
                'text' => $b->name,
                'url'  => "/productos?brands[]={$b->slug}",
                'type' => 'brand',
            ]);
    }

    private function suggestBusinessLines(string $q): Collection
    {
        $qClean = $this->sanitizeQuery($q);
        return BusinessLine::where('is_active', true)
            ->where(fn($query) =>
                $query->where('name', 'ILIKE', "%{$q}%")
                      ->orWhere('name', 'ILIKE', "%{$qClean}%")
            )
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
        $qClean = $this->sanitizeQuery($q);

        // ✅ USANDO SCOPE ACTIVENOW (Filtra fechas de inicio y fin)
        return DynamicCategory::activeNow()
            ->where(fn($query) =>
                $query->where('name', 'ILIKE', "%{$q}%")
                      ->orWhere('name', 'ILIKE', "%{$qClean}%")
            )
            ->limit(2)
            ->get()
            ->map(fn($d) => [
                'text' => $d->name,
                'url'  => "/productos?dynamics[]={$d->slug}",
                'type' => 'dynamic',
            ]);
    }

    // =========================================================================
    // Lógica de Formateo y Precios con Validación de Vigencia Temporal
    // =========================================================================

    private function formatProductResponse(mixed $item): array
    {
        return $item instanceof ProductPack
            ? $this->formatPack($item)
            : $this->formatProduct($item);
    }

    private function formatPack(ProductPack $pack): array
    {
        // ✅ VALIDACIÓN DE VIGENCIA PARA PACK
        $isPromoActive = $pack->is_on_promotion &&
            (!$pack->promo_start_at || $pack->promo_start_at->isPast()) &&
            (!$pack->promo_end_at || $pack->promo_end_at->isFuture());

        return [
        'id'         => "pk-{$pack->id}",
        'name'       => $pack->name,
        'sku'        => 'PACK-' . $pack->id, // Mantener para el buscador, pero lo ignoraremos en el visual
        'type'       => 'pack', // <--- AGREGAR ESTO
        'slug'       => $pack->slug,
        'price'      => (float) ($isPromoActive ? ($pack->promo_price ?? $pack->price) : $pack->price),
        'is_promo'   => $isPromoActive,
        'image'      => $pack->mainImage?->file_path,
        'target_url' => "/producto/{$pack->slug}",
    ];
    }

    private function formatProduct(Product $product): array
    {
        $v = $product->mainVariant;
        
        // ✅ VALIDACIÓN DE VIGENCIA PARA PRODUCTO/VARIANTE
        $isPromoActive = false;
        if ($v && $v->is_on_promo) {
            $isPromoActive = (!$v->promo_start_at || $v->promo_start_at->isPast()) &&
                             (!$v->promo_end_at || $v->promo_end_at->isFuture());
        }

        return [
        'id'         => $product->id,
        'name'       => $product->name,
        'sku'        => $v?->sku,
        'type'       => 'product', // <--- AGREGAR ESTO
        'slug'       => $product->slug,
        'price'      => (float) ($isPromoActive ? $v->promo_price : ($v?->price ?? 0)),
        'is_promo'   => $isPromoActive,
        'image'      => $v?->mainImage?->file_path,
        'target_url' => "/producto/{$product->slug}",
    ];
    }
}