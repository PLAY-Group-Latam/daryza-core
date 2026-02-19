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

            $content = $this->processSingleFiles($content, $sectionId);
            $content = $this->processMediaArray($content, $sectionId);
            $content = $this->processBrandsArray($content, $sectionId);
            $content = $this->processItemsArray($content, $sectionId);
            $content = $this->processBanksArray($content, $sectionId);
            $content = $this->processSocialsArray($content, $sectionId);
            $finalData = $this->mergeWithExisting($sectionContent->content ?? [], $content);

            return $sectionContent->update(['content' => $finalData]);
        });
    }

    // Funciones Privadas

    private function uploadFile(UploadedFile $file, int $sectionId): string
    {
        $mime = $file->getMimeType();
        $typeFolder = Str::contains($mime, 'video') ? 'videos' : 'images';
        return $this->gcs->uploadFile($file, "sections/{$sectionId}/{$typeFolder}");
    }

    private function processSingleFiles(array $content, int $sectionId): array
    {
        foreach ($content as $key => $value) {
            if ($value instanceof UploadedFile) {
                $content[$key] = $this->uploadFile($value, $sectionId);
            }
        }
        return $content;
    }

    private function processMediaArray(array $content, int $sectionId): array
    {
        if (!isset($content['media']) || !is_array($content['media'])) {
            return $content;
        }

        $processed = [];

        foreach ($content['media'] as $item) {
            if (!isset($item['src']) || empty($item['src'])) continue;

            if ($item['src'] instanceof UploadedFile) {
                $item['src'] = $this->uploadFile($item['src'], $sectionId);
            }

            $processed[] = [
                'src'      => $item['src'],
                'type'     => $item['type'] ?? 'image',
                'device'   => $item['device'] ?? 'desktop',
                'link_url' => $item['link_url'] ?? null,
            ];
        }

        $content['media'] = $processed;
        return $content;
    }

    private function processBrandsArray(array $content, int $sectionId): array
    {
        if (!isset($content['brands']) || !is_array($content['brands'])) {
            return $content;
        }

        $processed = [];

        foreach ($content['brands'] as $item) {
            if (isset($item['image']) && $item['image'] instanceof UploadedFile) {
                $item['image'] = $this->uploadFile($item['image'], $sectionId);
            }

            $processed[] = [
                'image' => $item['image'] ?? null,
                'name'  => $item['name'] ?? '',
            ];
        }

        $content['brands'] = $processed;
        return $content;
    }

   private function processItemsArray(array $content, int $sectionId): array
{
    if (!isset($content['items']) || !is_array($content['items'])) {
        return $content;
    }

    $existingById = [];
    $sectionContent = SectionContent::where('page_section_id', $sectionId)->first();
    if ($sectionContent && isset($sectionContent->content['items'])) {
        foreach ($sectionContent->content['items'] as $existingItem) {
            $existingById[$existingItem['id']] = $existingItem;
        }
    }

    $processed = [];

    foreach ($content['items'] as $item) {
        $itemId  = $item['id'];
        $existing = $existingById[$itemId] ?? [];
        $result  = ['id' => $itemId];

       
        foreach ($item as $field => $value) {
            if ($field === 'id') continue;

            if ($value instanceof UploadedFile) {
                
                $result[$field] = $this->uploadFile($value, $sectionId);
            } elseif (empty($value) && isset($existing[$field])) {
               
                $result[$field] = $existing[$field];
            } else {
                
                $result[$field] = $value;
            }
        }

        $processed[] = $result;
    }

    $content['items'] = $processed;
    return $content;
}

private function processBanksArray(array $content, int $sectionId): array
{
    if (!isset($content['banks']) || !is_array($content['banks'])) {
        return $content;
    }

    $processed = [];

    foreach ($content['banks'] as $item) {
        if (isset($item['image']) && $item['image'] instanceof UploadedFile) {
            $item['image'] = $this->uploadFile($item['image'], $sectionId);
        }

        $processed[] = [
            'id'    => $item['id'],
            'image' => $item['image'] ?? null,
        ];
    }

    $content['banks'] = $processed;
    return $content;
}

private function processSocialsArray(array $content, int $sectionId): array
{
    if (!isset($content['socials']) || !is_array($content['socials'])) {
        return $content;
    }

    $processed = [];

    foreach ($content['socials'] as $item) {
        if (isset($item['image']) && $item['image'] instanceof UploadedFile) {
            $item['image'] = $this->uploadFile($item['image'], $sectionId);
        }

        $processed[] = [
            'id'    => $item['id'],
            'image' => $item['image'] ?? null,
            'url'   => $item['url'] ?? '',
        ];
    }

    $content['socials'] = $processed;
    return $content;
}

    private function mergeWithExisting(array $existing, array $content): array
    {
        
        $replaceableArrays = ['media', 'brands','items','banks','socials'];

        foreach ($replaceableArrays as $key) {
            if (isset($content[$key])) {
                $existing[$key] = $content[$key];
                unset($content[$key]);
            }
        }

        return array_merge($existing, $content);
    }
}