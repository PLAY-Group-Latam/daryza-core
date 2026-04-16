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
public function searchProductsByName(?string $search, int $limit = 10): array
{
    $search = trim($search ?? '');

    if (strlen($search) < 3) {
        return ['searchResults' => []];
    }

    $searchTerm = "%{$search}%";

    $products = Product::query()
        ->select('id', 'name', 'slug') // Traemos slug por si quieres linkear
        ->where('name', 'ilike', $searchTerm)
        ->active() 
        ->with([
            'mainVariant' => function ($q) {
                // Seleccionamos todos los campos necesarios para el cálculo de promo
                $q->select(
                    'id', 'product_id', 'sku', 'price', 
                    'promo_price', 'is_on_promo', 'promo_start_at', 'promo_end_at'
                )
                ->with(['media' => function($q) {
                    $q->where('type', 'image')
                      ->select('id', 'mediable_id', 'mediable_type', 'file_path')
                      ->orderBy('order', 'asc');
                }]);
            }
        ])
        ->limit($limit)
        ->get()
        ->map(fn($p) => [
            'product_id'   => $p->id,
            'variant_id'   => $p->mainVariant?->id,
            'product_name' => $p->name,
            'slug'         => $p->slug,
            'sku'          => $p->mainVariant?->sku ?? 'S/N',
            'image'        => $p->mainVariant?->media->first()?->file_path ?? null,
            
            // --- Información de Precios ---
            'price'        => $p->mainVariant?->price,
            'promo_price'  => $p->mainVariant?->promo_price,
            'is_on_promo'  => $p->mainVariant?->is_on_promo ?? false,
            // Usamos el Accessor que ya tienes definido en ProductVariant
            'active_price' => $p->mainVariant?->active_price, 
            
            // Opcional: Calcular si la promo es válida realmente ahora mismo
            'has_valid_promo' => $p->mainVariant ? (
                $p->mainVariant->is_on_promo && 
                (!$p->mainVariant->promo_start_at || $p->mainVariant->promo_start_at->isPast()) && 
                (!$p->mainVariant->promo_end_at || $p->mainVariant->promo_end_at->isFuture())
            ) : false,
        ]);

    return [
        'searchResults' => $products
    ];
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
            $content = $this->processPromoObject($content, $sectionId);

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
    private function processPromoObject(array $content, int $sectionId): array
{
    if (!isset($content['promo']) || !is_array($content['promo'])) {
        return $content;
    }

    $promo = $content['promo'];

    if (isset($promo['src_desktop']) && $promo['src_desktop'] instanceof UploadedFile) {
        $promo['src_desktop'] = $this->uploadFile($promo['src_desktop'], $sectionId);
    }

    if (isset($promo['src_mobile']) && $promo['src_mobile'] instanceof UploadedFile) {
        $promo['src_mobile'] = $this->uploadFile($promo['src_mobile'], $sectionId);
    }

    $content['promo'] = [
        'src_desktop' => $promo['src_desktop'] ?? null,
        'src_mobile'  => $promo['src_mobile']  ?? null,
        'link_url'    => $promo['link_url']     ?? null,
    ];

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
            $idKey = isset($existingItem['product_id']) ? 'product_id' : 'id';
            if (isset($existingItem[$idKey])) {
                $existingById[$existingItem[$idKey]] = $existingItem;
            }
        }
    }

    $processed = [];

    foreach ($content['items'] as $item) {
        $idKey = isset($item['product_id']) ? 'product_id' : 'id';
        if (!isset($item[$idKey])) continue; 

        $itemId   = $item[$idKey];
        $existing = $existingById[$itemId] ?? [];
        $result   = [$idKey => $itemId];

        foreach ($item as $field => $value) {
            if ($field === 'id' || $field === 'product_id') continue;

            if ($value instanceof UploadedFile) {
                $result[$field] = $this->uploadFile($value, $sectionId);
            } 
            // CAMBIO AQUÍ: 
            // Solo rescatamos lo existente si el campo NI SIQUIERA viene en el request.
            // Si el campo viene pero es null o "null" string, lo guardamos como null (borrado).
            elseif (!array_key_exists($field, $item)) {
                $result[$field] = $existing[$field] ?? null;
            } else {
                // Si el valor es "null" (string que a veces manda FormData) o null real, guardamos null
                $result[$field] = ($value === 'null' || empty($value)) ? null : $value;
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
        $replaceableArrays = ['slides', 'media', 'brands', 'items', 'banks', 'socials', 'cards', 'banner', 'years','promo'];

        foreach ($replaceableArrays as $key) {
            if (isset($content[$key])) {
                $existing[$key] = $content[$key];
                unset($content[$key]);
            }
        }

        return array_merge($existing, $content);
    }
}