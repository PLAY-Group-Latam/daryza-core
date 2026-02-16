<?php

namespace App\Http\Web\Services\Content;

use App\Models\Content\Page;
use App\Models\Content\PageSection;
use App\Models\Content\SectionContent;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;
use App\Http\Web\Services\GcsService;
use Illuminate\Http\UploadedFile;

class ContentService
{
    protected GcsService $gcs;
        
    public function __construct(GcsService $gcs)
    {
        $this->gcs = $gcs;
    }

    public function getAllPagesWithSections(): Collection
    {
        return Page::with(['sections' => function ($query) {
            $query->orderBy('sort_order', 'asc');
        }])->get();
    }

    public function getValidatedSection(string $slug, string $type, int $id): PageSection
    {
        $section = PageSection::with(['content', 'page'])->findOrFail($id);

        if ($section->page->slug !== $slug || $section->type !== $type) {
            abort(404, 'Integridad de ruta inválida.');
        }

        return $section;
    }

    public function updateSectionContent(int $sectionId, array $content): bool
    {
        return DB::transaction(function () use ($sectionId, $content) {
            $sectionContent = SectionContent::where('page_section_id', $sectionId)->firstOrFail();

            // ✅ PRIMERO: Procesar campos individuales de archivos (image, logo, banner, video, etc.)
            // Esto debe ir ANTES del procesamiento de media array
            foreach ($content as $key => $value) {
                // Si es un UploadedFile individual (no dentro de un array)
                if ($value instanceof UploadedFile) {
                    $mime = $value->getMimeType();
                    $typeFolder = Str::contains($mime, 'video') ? 'videos' : 'images';
                    $directory = "sections/{$sectionId}/{$typeFolder}";
                    $content[$key] = $this->gcs->uploadFile($value, $directory);
                }
            }

            // ✅ SEGUNDO: Procesar array de media (para banners dinámicos)
            if (isset($content['media']) && is_array($content['media'])) {
                $processedMedia = [];
                
                foreach ($content['media'] as $i => $item) {
                    // Solo procesar items que tengan src válido
                    if (!isset($item['src']) || empty($item['src'])) {
                        continue;
                    }
                    
                    // Si es archivo, subirlo
                    if ($item['src'] instanceof UploadedFile) {
                        $mime = $item['src']->getMimeType();
                        $typeFolder = Str::contains($mime, 'video') ? 'videos' : 'images';
                        $directory = "sections/{$sectionId}/{$typeFolder}";

                        $item['src'] = $this->gcs->uploadFile($item['src'], $directory);
                    }
                    
                    // Asegurar que tenga todos los campos necesarios
                    $processedMedia[] = [
                        'src' => $item['src'],
                        'type' => $item['type'] ?? 'image',
                        'device' => $item['device'] ?? 'desktop',
                        'link_url' => $item['link_url'] ?? null,
                    ];
                }
                
                $content['media'] = $processedMedia;
            }

            // ✅ TERCERO: Hacer merge con contenido existente
            $existingContent = $sectionContent->content ?? [];
            
            // Si estamos actualizando media, reemplazar completamente el array
            if (isset($content['media'])) {
                $existingContent['media'] = $content['media'];
                unset($content['media']); // Ya lo procesamos
            }
            
            $finalData = array_merge($existingContent, $content);

            return $sectionContent->update(['content' => $finalData]);
        });
    }
}