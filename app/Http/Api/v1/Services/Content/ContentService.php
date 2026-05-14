<?php

namespace App\Http\Api\v1\Services\Content;

use App\Models\Content\PageSection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Log;

class ContentService
{
    /**
     * Obtiene el contenido de una sección específica
     */
    public function getSectionContent(string $slug, string $type, int $id): array
    {
        try {
            $section = PageSection::with(['content', 'page'])
                ->where('id', $id)
                ->where('type', $type)
                ->whereHas('page', function ($query) use ($slug) {
                    $query->where('slug', $slug);
                })
                ->firstOrFail();

            $content = $section->content->content ?? [];

            // ✅ Si es tipo banner, expandir el array media a múltiples items
            if ($type === 'banner' && isset($content['media']) && is_array($content['media'])) {
                
                Log::info('🔧 ANTES de normalizar:', ['media' => $content['media']]);
                
                // 🔧 NORMALIZAR: Combinar objetos con device y src
                $normalizedMedia = $this->normalizeMediaArray($content['media']);
                
                Log::info('✅ DESPUÉS de normalizar:', ['normalizedMedia' => $normalizedMedia]);
                
                $bannerItems = [];
                
                foreach ($normalizedMedia as $mediaItem) {
                    if (isset($mediaItem['src']) && !empty($mediaItem['src'])) {
                        $bannerItems[] = [
                            'type' => $content['type'] ?? 'image',
                            'is_visible' => $content['is_visible'] ?? '1',
                            'link_url' => $content['link_url'] ?? null,
                            'media' => [$mediaItem],
                            'media_desktop' => $mediaItem['src'],
                            'media_mobile' => $mediaItem['src'],
                        ];
                    }
                }
                
                Log::info('🎯 bannerItems creados:', ['count' => count($bannerItems), 'items' => $bannerItems]);
                
                return [
                    'success' => true,
                    'data' => $bannerItems,
                    'metadata' => [
                        'section_name' => $section->name,
                        'updated_at' => $section->content->updated_at ?? null
                    ]
                ];
            }

            return [
                'success' => true,
                'data' => $content,
                'metadata' => [
                    'section_name' => $section->name,
                    'updated_at' => $section->content->updated_at ?? null
                ]
            ];

        } catch (ModelNotFoundException $e) {
            abort(404, 'La sección solicitada no existe o la ruta es inválida.');
        }
    }

    /**
     * Normaliza el array media para que cada elemento tenga src y device
     */
    private function normalizeMediaArray(array $media): array
    {
        $devices = [];
        $sources = [];

        // Separar por tipo
        foreach ($media as $item) {
            if (isset($item['device']) && !isset($item['src'])) {
                $devices[] = $item['device'];
            }
            if (isset($item['src']) && !isset($item['device'])) {
                $sources[] = $item['src'];
            }
            // Si ya tiene ambos, lo dejamos tal cual
            if (isset($item['src']) && isset($item['device'])) {
                return $media; // Ya está bien formateado
            }
        }

        // Reconstruir combinando devices con sources
        $normalized = [];
        $maxLength = max(count($devices), count($sources));

        for ($i = 0; $i < $maxLength; $i++) {
            $normalized[] = [
                'src' => $sources[$i] ?? '',
                'device' => $devices[$i] ?? 'both'
            ];
        }

        return $normalized;
    }

 
public function getPageFullContent(string $slug): array
{
    $sections = \App\Models\Content\PageSection::with('content')
        ->whereHas('page', function ($query) use ($slug) {
            $query->where('slug', $slug);
        })
        ->orderBy('sort_order', 'asc')
        ->get();

    return $sections->mapWithKeys(function ($section) {
        $content = $section->content->content ?? [];

        // 1. Control de contenido vacío
        if (empty($content)) {
            return [$section->type => new \stdClass()]; 
        }

        // 2. Control de visibilidad
        if (isset($content['is_visible'])) {
            $isVisible = filter_var($content['is_visible'], FILTER_VALIDATE_BOOLEAN);
            if (!$isVisible) return [$section->type => new \stdClass()];
        }

        // 3. Lógica específica para PRODUCTOS (Secciones como blog_products)
        if ($section->type === 'blog_products' && isset($content['items'])) {
            $productIds = collect($content['items'])->pluck('product_id')->toArray();

            $products = \App\Models\Products\Product::whereIn('id', $productIds)
                ->active()
                ->with(['mainVariant.mainImage'])
                ->get()
                ->map(function ($product) {
                    $variant = $product->mainVariant;
                    
                    // Lógica de validación de promoción activa (coincide con tu scopeOnPromoActive)
                    $isPromoActuallyActive = false;
                    if ($variant) {
                        $now = now();
                        $isPromoActuallyActive = $variant->is_on_promo &&
                            (!$variant->promo_start_at || $variant->promo_start_at <= $now) &&
                            (!$variant->promo_end_at || $variant->promo_end_at > $now);
                    }

                    return [
                        'id'   => $product->id,
                        'name' => $product->name,
                        'slug' => $product->slug,
                        'itemType' => 'product',
                        'main_image' => [
                            'id'        => $variant?->mainImage?->id ?? $product->id,
                            'file_path' => $variant?->mainImage?->file_path ?? '/placeholder.png', 
                        ],
                        'main_variant' => $variant ? [
                            'id'             => $variant->id,
                            'sku'            => $variant->sku,
                            'price'          => $variant->price,
                            'promo_price'    => $variant->promo_price,
                            'active_price'   => $variant->active_price, // El accessor del modelo ya usa la lógica de tiempo
                            'is_on_promo'    => $isPromoActuallyActive, 
                            'stock'          => $variant->stock,
                            'promo_start_at' => $variant->promo_start_at?->toIso8601String(),
                            'promo_end_at'   => $variant->promo_end_at?->toIso8601String(),
                        ] : null,
                    ];
                });

            return [$section->type => $products];
        }

        // 4. Lógica para Banners y otros tipos de contenido
        if (isset($content['media']) && is_array($content['media'])) {
            $content['media'] = $this->normalizeMediaArray($content['media']);
        }

        return [$section->type => $content];
    })->toArray();
}
}