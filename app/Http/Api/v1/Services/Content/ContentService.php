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

    /**
     * Obtiene todo el contenido de una página
     */
    public function getPageFullContent(string $slug): array
    {
        $sections = PageSection::with('content')
            ->whereHas('page', function ($query) use ($slug) {
                $query->where('slug', $slug);
            })
            ->orderBy('sort_order', 'asc')
            ->get();

        return $sections->mapWithKeys(function ($section) {
            $content = $section->content->content ?? [];

            if (empty($content)) {
                return [$section->type => new \stdClass()]; 
            }

            if (isset($content['is_visible'])) {
                $isVisible = filter_var($content['is_visible'], FILTER_VALIDATE_BOOLEAN);
                if (!$isVisible) return [$section->type => new \stdClass()];
            }

            // ✅ Normalizar media también aquí si es necesario
            if (isset($content['media']) && is_array($content['media'])) {
                $content['media'] = $this->normalizeMediaArray($content['media']);
            }

            return [$section->type => $content];
        })->toArray();
    }
}