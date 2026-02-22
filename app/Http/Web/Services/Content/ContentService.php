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
use App\Models\Products\Product;


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
public function getExtraDataForSection(string $type): array
{
    return match ($type) {

        'blog_products' => [
            'products' => Product::query()
                ->where('is_active', true)
                ->with([
                    'variants' => function ($query) {
                        $query->where('is_main', true)
                              ->with(['media' => function ($q) {
                                  $q->where('type', 'image');
                              }]);
                    }
                ])
                ->select('id', 'name', 'slug')
                ->orderBy('name')
                ->get()
                ->map(function ($product) {

                    $mainVariant = $product->variants->first();
                    $image = $mainVariant?->media->first()?->file_path;

                    return [
                        'id'    => $product->id,
                        'name'  => $product->name,
                        'slug'  => $product->slug,
                        'image' => $image,
                    ];
                }),
        ],

        default => [],
    };
}

    public function updateSectionContent(int $sectionId, array $content): bool
    {
        return DB::transaction(function () use ($sectionId, $content) {
            $sectionContent = SectionContent::where('page_section_id', $sectionId)->firstOrFail();

            $content = $this->processSingleFiles($content, $sectionId);
            $content = $this->processBannerObject($content, $sectionId);
            $content = $this->processYearsArray($content, $sectionId);
            $content = $this->processSlidesArray($content, $sectionId);
            $content = $this->processMediaArray($content, $sectionId);
            $content = $this->processItemsArray($content, $sectionId, $sectionContent);
            $content = $this->processCardsArray($content, $sectionId, $sectionContent);
            $content = $this->processSimpleImageArray($content, 'brands', ['image' => null, 'name'  => ''], $sectionId);
            $content = $this->processSimpleImageArray($content, 'banks',  ['id'    => null, 'image' => null], $sectionId);
            $content = $this->processSimpleImageArray($content, 'socials', ['id'   => null, 'image' => null, 'url' => ''], $sectionId);

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

    private function processBannerObject(array $content, int $sectionId): array
    {
        if (!isset($content['banner']) || !is_array($content['banner'])) {
            return $content;
        }

        $banner = $content['banner'];

        if (isset($banner['src_desktop']) && $banner['src_desktop'] instanceof UploadedFile) {
            $banner['src_desktop'] = $this->uploadFile($banner['src_desktop'], $sectionId);
        }

        if (isset($banner['src_mobile']) && $banner['src_mobile'] instanceof UploadedFile) {
            $banner['src_mobile'] = $this->uploadFile($banner['src_mobile'], $sectionId);
        }

        $content['banner'] = [
            'type'        => $banner['type']       ?? 'image',
            'src_desktop' => $banner['src_desktop'] ?? null,
            'src_mobile'  => $banner['src_mobile']  ?? null,
            'link_url'    => $banner['link_url']     ?? null,
        ];

        return $content;
    }

    private function processYearsArray(array $content, int $sectionId): array
    {
        if (!isset($content['years']) || !is_array($content['years'])) {
            return $content;
        }

        $content['years'] = array_map(function ($year) use ($sectionId) {
            if (isset($year['imagen']) && $year['imagen'] instanceof UploadedFile) {
                $year['imagen'] = $this->uploadFile($year['imagen'], $sectionId);
            }

            return [
                'anio'   => $year['anio']   ?? '',
                'imagen' => $year['imagen'] ?? null,
                'texto'  => $year['texto']  ?? '',
            ];
        }, $content['years']);

        return $content;
    }

    private function processSimpleImageArray(array $content, string $key, array $fields, int $sectionId): array
    {
        if (!isset($content[$key]) || !is_array($content[$key])) {
            return $content;
        }

        $content[$key] = array_map(function ($item) use ($fields, $sectionId) {
            if (isset($item['image']) && $item['image'] instanceof UploadedFile) {
                $item['image'] = $this->uploadFile($item['image'], $sectionId);
            }

            $result = [];
            foreach ($fields as $field => $default) {
                $result[$field] = $item[$field] ?? $default;
            }
            return $result;
        }, $content[$key]);

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

    private function processSlidesArray(array $content, int $sectionId): array
    {
        if (!isset($content['slides']) || !is_array($content['slides'])) {
            return $content;
        }

        $processed = [];

        foreach ($content['slides'] as $slide) {
            $result = [
                'id'        => $slide['id'],
                'type'      => $slide['type'] ?? 'image',
                'is_active' => filter_var($slide['is_active'] ?? true, FILTER_VALIDATE_BOOLEAN),
                'link_url'  => $slide['link_url'] ?? null,
            ];

            switch ($result['type']) {
                case 'image':
                case 'url':
                    $result['src_desktop'] = isset($slide['src_desktop']) && $slide['src_desktop'] instanceof UploadedFile
                        ? $this->uploadFile($slide['src_desktop'], $sectionId)
                        : ($slide['src_desktop'] ?? null);

                    $result['src_mobile'] = isset($slide['src_mobile']) && $slide['src_mobile'] instanceof UploadedFile
                        ? $this->uploadFile($slide['src_mobile'], $sectionId)
                        : ($slide['src_mobile'] ?? null);
                    break;

                case 'video':
                    $result['src_video'] = isset($slide['src_video']) && $slide['src_video'] instanceof UploadedFile
                        ? $this->uploadFile($slide['src_video'], $sectionId)
                        : ($slide['src_video'] ?? null);
                    break;
            }

            $processed[] = $result;
        }

        $content['slides'] = $processed;
        return $content;
    }

    private function processItemsArray(array $content, int $sectionId, SectionContent $sectionContent): array
    {
        if (!isset($content['items']) || !is_array($content['items'])) {
            return $content;
        }

        $existingById = [];
        if (isset($sectionContent->content['items'])) {
            foreach ($sectionContent->content['items'] as $existingItem) {
                $existingById[$existingItem['id']] = $existingItem;
            }
        }

        $processed = [];

        foreach ($content['items'] as $item) {
            $itemId   = $item['id'];
            $existing = $existingById[$itemId] ?? [];
            $result   = ['id' => $itemId];

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

    private function processCardsArray(array $content, int $sectionId, SectionContent $sectionContent): array
    {
        if (!isset($content['cards']) || !is_array($content['cards'])) {
            return $content;
        }

        $existingCards = $sectionContent->content['cards'] ?? [];
        $processed     = [];

        foreach ($content['cards'] as $index => $card) {
            $existing = $existingCards[$index] ?? [];
            $result   = [];

            foreach ($card as $field => $value) {
                if ($field === 'imagen') continue;
                $result[$field] = $value ?? $existing[$field] ?? null;
            }

            if (isset($card['imagen']) && $card['imagen'] instanceof UploadedFile) {
                $result['imagen'] = $this->uploadFile($card['imagen'], $sectionId);
            } else {
                $result['imagen'] = !empty($card['imagen']) ? $card['imagen'] : ($existing['imagen'] ?? null);
            }

            $processed[] = $result;
        }

        $content['cards'] = $processed;
        return $content;
    }

    private function mergeWithExisting(array $existing, array $content): array
    {
        $replaceableArrays = ['slides', 'media', 'brands', 'items', 'banks', 'socials', 'cards', 'banner', 'years'];

        foreach ($replaceableArrays as $key) {
            if (isset($content[$key])) {
                $existing[$key] = $content[$key];
                unset($content[$key]);
            }
        }

        return array_merge($existing, $content);
    }
}