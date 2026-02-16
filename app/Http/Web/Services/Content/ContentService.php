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

            foreach ($content as $key => $value) {
               
                if ($value instanceof UploadedFile) {
                   
                    $mime = $value->getMimeType();
                    $typeFolder = Str::contains($mime, 'video') ? 'videos' : 
                                 (Str::contains($mime, 'pdf') ? 'docs' : 'images');

                    $directory = "sections/{$sectionId}/{$typeFolder}";

                    $publicUrl = $this->gcs->uploadFile($value, $directory);

                   
                    $content[$key] = $publicUrl;
                }
            }

        
            $existingContent = $sectionContent->content ?? [];
            $finalData = array_merge($existingContent, $content);

            return $sectionContent->update([
                'content' => $finalData
            ]);
        });
    }
}
