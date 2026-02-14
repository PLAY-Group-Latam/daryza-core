<?php

namespace App\Http\Web\Services\Content;

use App\Models\Content\Page;
use App\Models\Content\PageSection;
use App\Models\Content\SectionContent;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;
use App\Http\Web\Services\GcsService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;

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

        Log::info('🔵 Iniciando updateSectionContent', [
            'section_id' => $sectionId
        ]);

        $sectionContent = SectionContent::where('page_section_id', $sectionId)->firstOrFail();

        if (isset($content['image']) && $content['image'] instanceof UploadedFile) {

            $directory = "sections/{$sectionId}/images";

            $publicUrl = $this->gcs->uploadFile(
                $content['image'],
                $directory
            );

            $content['image'] = $publicUrl;

            Log::info('🟢 Imagen subida a GCS', [
                'url' => $publicUrl
            ]);
        }

        Log::info('🟣 JSON final guardado', [
            'content' => $content
        ]);

        return $sectionContent->update([
            'content' => $content
        ]);
    });
}



}
