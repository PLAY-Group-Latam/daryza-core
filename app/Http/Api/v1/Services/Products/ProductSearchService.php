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
    public function getSuggestions(string $query, int $limit = 6): array
    {
        $q = trim($query);
        $lowQ = mb_strtolower($q);
        
        if (mb_strlen($q) < 2) return ['products' => [], 'suggestions' => []];

        // 1. Obtener productos y packs para el lado derecho
        $productsCollection = $this->fetchProductsRaw($q, $limit);

        // 2. Obtener Categorías
        $categories = ProductCategory::active()
            ->where('name', 'ILIKE', "%{$q}%")
            ->limit(3)->get()
            ->map(fn($c) => [
                'text' => $c->name,
                'url'  => $c->parent_id 
                    ? "/productos?categories[]={$c->parent->slug}&subcategories[]={$c->slug}" 
                    : "/productos?categories[]={$c->slug}",
                'type' => 'category'
            ]);

        // 3. Obtener Marcas
        $brands = AttributesValue::whereHas('attribute', fn($query) => $query->where('name', 'ILIKE', '%Marca%'))
            ->where('value', 'ILIKE', "%{$q}%")
            ->limit(2)->get()
            ->map(fn($b) => [
                'text' => $b->value,
                'url'  => "/productos?brands[]={$b->id}",
                'type' => 'brand'
            ]);

        // 4. Obtener Líneas de Negocio (Usa el ID según tu FilterService)
        $businessLines = BusinessLine::where('is_active', true)
            ->where('name', 'ILIKE', "%{$q}%")
            ->limit(2)->get()
            ->map(fn($bl) => [
                'text' => $bl->name,
                'url'  => "/productos?business_lines[]={$bl->id}",
                'type' => 'business_line'
            ]);

        // 5. Obtener Dinámicas (Usa el Slug según tu FilterService)
        $dynamics = DynamicCategory::where('is_active', true)
            ->where('name', 'ILIKE', "%{$q}%")
            ->limit(2)->get()
            ->map(fn($d) => [
                'text' => $d->name,
                'url'  => "/productos?dynamics[]={$d->slug}",
                'type' => 'dynamic'
            ]);

        // 6. Combinar y Limpiar duplicados por texto (Evita doble "Perfumadores")
        $entities = collect([])
            ->concat($categories)
            ->concat($brands)
            ->concat($businessLines)
            ->concat($dynamics)
            ->unique(fn($item) => mb_strtolower($item['text']));

        // 7. Construir lista final de sugerencias
        $leftSuggestions = collect([]);
        $existsExactMatch = $entities->contains(fn($item) => mb_strtolower($item['text']) === $lowQ);

        // Si no hay match exacto con una entidad, la primera opción es la búsqueda general
        if (!$existsExactMatch) {
            $targetUrl = "/productos?q=" . urlencode($q);
            
            // Atajo para Packs
            if (in_array($lowQ, ['pack', 'packs'])) {
                $targetUrl = "/productos?is_pack=true";
            }

            $leftSuggestions->push([
                'text' => $q, 
                'url'  => $targetUrl,
                'type' => 'query' 
            ]);
        }

        // Unimos la query general con las entidades encontradas
        $finalSuggestions = $leftSuggestions->concat($entities);

        return [
            'products' => $productsCollection->map(fn($p) => $this->formatProductResponse($p))->values(),
            'suggestions' => $finalSuggestions->values()->take($limit)
        ];
    }

    private function fetchProductsRaw(string $q, int $limit): Collection
    {
        $standard = Product::active()
            ->where(function($query) use ($q) {
                $query->where('name', 'ILIKE', "%{$q}%")
                      ->orWhereHas('variants', fn($v) => $v->where('sku', 'ILIKE', "%{$q}%"));
            })
            ->with(['mainVariant.mainImage'])
            ->limit($limit)
            ->get();

        $packs = ProductPack::where('is_active', true)
            ->where('name', 'ILIKE', "%{$q}%")
            ->with(['mainImage'])
            ->limit(2)
            ->get();

        return $standard->concat($packs)->take($limit);
    }

    private function formatProductResponse($item): array
    {
        $isPack = $item instanceof ProductPack;

        if ($isPack) {
            return [
                'id'         => "pk-{$item->id}",
                'name'       => $item->name,
                'sku'        => 'PACK-' . $item->id,
                'slug'       => $item->id,
                'price'      => (float) ($item->is_on_promotion ? $item->promo_price : $item->price),
                'is_promo'   => (bool) $item->is_on_promotion,
                'image'      => $item->mainImage?->file_path ?? null,
                'target_url' => "/packs/{$item->id}"
            ];
        }

        $v = $item->mainVariant;
        $isPromo = $v?->is_on_promo && 
                  (!$v->promo_start_at || $v->promo_start_at->isPast()) && 
                  (!$v->promo_end_at || $v->promo_end_at->isFuture());

        return [
            'id'         => $item->id,
            'name'       => $item->name,
            'sku'        => $v?->sku,
            'slug'       => $item->slug,
            'price'      => (float) ($isPromo ? $v->promo_price : $v->price),
            'is_promo'   => $isPromo,
            'image'      => $v?->mainImage?->file_path ?? null,
            'target_url' => "/producto/{$item->slug}"
        ];
    }
}