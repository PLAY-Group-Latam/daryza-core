<?php

namespace App\Http\Api\v1\Services\Products;

use App\Models\Products\Product;
use App\Models\Products\ProductPack;
use App\Models\Products\ProductCategory;
use App\Models\Products\AttributesValue;
use App\Models\Products\BusinessLine;
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

        $hasExactMatch = $entities->contains(
            fn($item) => mb_strtolower($item['text']) === $lowQ
        );

        $head = $hasExactMatch
            ? collect()
            : collect([[
                'text' => $q,
                'url'  => $this->generalSearchUrl($q, $lowQ),
                'type' => 'query',
            ]]);

        return $head->concat($entities);
    }

    private function suggestCategories(string $q): Collection
    {
        return ProductCategory::active()
            ->where('name', 'ILIKE', "%{$q}%")
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
        return AttributesValue::whereHas(
                'attribute',
                fn($query) => $query->where('name', 'ILIKE', '%Marca%')
            )
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

    private function generalSearchUrl(string $q, string $lowQ): string
    {
        if (in_array($lowQ, ['pack', 'packs'])) {
            return '/productos?is_pack=true';
        }

        return '/productos?q=' . urlencode($q);
    }

    // =========================================================================
    // Formato de respuesta
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