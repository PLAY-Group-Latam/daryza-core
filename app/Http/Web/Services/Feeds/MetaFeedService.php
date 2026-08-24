<?php

namespace App\Http\Web\Services\Feeds;

use App\Models\Products\Product;
use App\Models\Products\ProductVariant;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use XMLWriter;

class MetaFeedService
{
    private const CURRENCY = 'PEN';
    private const BRAND = 'Daryza';

    /** @var array<string, bool> */
    private array $writtenItemIds = [];

    public function toXml(): string
    {
        $this->writtenItemIds = [];

        $xml = new XMLWriter();
        $xml->openMemory();
        $xml->startDocument('1.0', 'UTF-8');
        $xml->startElement('rss');
        $xml->writeAttribute('version', '2.0');
        $xml->writeAttribute('xmlns:g', 'http://base.google.com/ns/1.0');

        $xml->startElement('channel');
        $xml->writeElement('title', 'Daryza - Meta Catalog');
        $xml->writeElement('link', $this->siteUrl());
        $xml->writeElement('description', 'Feed de productos para Meta Commerce Manager de Daryza');

        $this->writeProducts($xml);

        $xml->endElement();
        $xml->endElement();
        $xml->endDocument();

        return $xml->outputMemory();
    }

    private function writeProducts(XMLWriter $xml): void
    {
        Product::query()
            ->with([
                'categories',
                'variants.media',
                'variants.attributes',
            ])
            ->orderBy('created_at', 'desc')
            ->chunk(200, function (EloquentCollection $products) use ($xml): void {
                foreach ($products as $product) {
                    foreach ($product->variants as $variant) {
                        if (!$variant->is_active) {
                            continue;
                        }

                        $feedId = $this->resolveFeedId($variant);

                        if ($this->alreadyWritten($feedId)) {
                            continue;
                        }

                        $images = $this->imageOnlyCollection(
                            $variant->media->where('type', 'image')->sortBy('order')->values()
                        );

                        // Atributos de la variante (ej. Color, Talla, etc.)
                        $attributeValues = $variant->attributes->pluck('name')->toArray();

                        $isSimple = empty($attributeValues);

                        $this->writeItem($xml, [
                            'id'                        => $feedId,
                            'title'                     => $this->feedTitle($product->name, $attributeValues, $isSimple),
                            'description'               => $this->description($product->description, $product->brief_description),
                            'availability'              => ((int) $variant->stock) > 0 ? 'in stock' : 'out of stock',
                            'price'                     => $this->formatPrice((float) $variant->price),
                            'sale_price'                => $this->salePrice($variant),
                            'sale_price_effective_date' => $this->salePriceEffectiveDate(
                                $variant->promo_start_at,
                                $variant->promo_end_at
                            ),
                            'link'                      => $this->productUrl($product->slug),
                            'images'                    => $images,
                            'item_group_id'             => $product->id,
                            'color'                     => $this->normalizeAttribute($this->findAttributeValue($variant, ['color', 'colour'])),
                            'size'                      => $this->normalizeAttribute($this->findAttributeValue($variant, ['size', 'talla'])),
                            'product_type'              => $product->categories->first()?->name,
                            'google_product_category'   => $product->categories->first()?->name,
                        ]);
                    }
                }
            });
    }

    private function writeItem(XMLWriter $xml, array $item): void
    {
        $itemId = (string) ($item['id'] ?? '');
        if ($itemId === '') {
            return;
        }

        $images = $this->imageOnlyCollection($item['images'] ?? collect());
        $mainImage = $this->imageUrl($images->first());

        if (!$mainImage) {
            Log::warning('Daryza feed item skipped: no valid image', [
                'item_id'       => $item['id'] ?? null,
                'item_group_id' => $item['item_group_id'] ?? null,
                'source'        => __METHOD__,
            ]);

            return;
        }

        $xml->startElement('item');
        $xml->writeElement('g:id', $itemId);
        $xml->writeElement('g:title', $item['title']);
        $xml->writeElement('g:description', $item['description']);
        $xml->writeElement('g:availability', $item['availability']);
        $xml->writeElement('g:condition', 'new');
        $xml->writeElement('g:price', $item['price']);

        if (!empty($item['sale_price'])) {
            $xml->writeElement('g:sale_price', $item['sale_price']);

            if (!empty($item['sale_price_effective_date'])) {
                $xml->writeElement('g:sale_price_effective_date', $item['sale_price_effective_date']);
            }
        }

        $xml->writeElement('g:link', $item['link']);
        $xml->writeElement('g:image_link', $mainImage);
        $xml->writeElement('g:brand', self::BRAND);
        $xml->writeElement('g:item_group_id', $item['item_group_id']);

        if (!empty($item['color'])) {
            $xml->writeElement('g:color', $item['color']);
        }

        if (!empty($item['size'])) {
            $xml->writeElement('g:size', $item['size']);
        }

        if (!empty($item['product_type'])) {
            $xml->writeElement('g:product_type', $item['product_type']);
        }

        if (!empty($item['google_product_category'])) {
            $xml->writeElement('g:google_product_category', $item['google_product_category']);
        }

        foreach ($images->slice(1) as $image) {
            $additionalImage = $this->imageUrl($image);

            if ($additionalImage) {
                $xml->writeElement('g:additional_image_link', $additionalImage);
            }
        }

        $xml->endElement();
    }

    private function salePrice(ProductVariant $variant): ?string
    {
        if (!$variant->is_on_promo || !$variant->promo_price) {
            return null;
        }

        if (!$this->hasActiveSalePrice(
            $variant->promo_price,
            $variant->price,
            $variant->promo_start_at,
            $variant->promo_end_at,
        )) {
            return null;
        }

        return $this->formatPrice((float) $variant->promo_price);
    }

    private function hasActiveSalePrice(
        mixed $salePrice,
        mixed $regularPrice,
        mixed $startDate,
        mixed $endDate,
    ): bool {
        if (!$salePrice || !$regularPrice) {
            return false;
        }

        // Si no hay fechas definidas pero is_on_promo está activo, se asume vigente
        if (!$startDate && !$endDate) {
            return (float) $salePrice < (float) $regularPrice;
        }

        $start = $startDate instanceof CarbonInterface ? $startDate : ($startDate ? \Carbon\Carbon::parse($startDate) : null);
        $end   = $endDate instanceof CarbonInterface ? $endDate : ($endDate ? \Carbon\Carbon::parse($endDate) : null);

        $now = now();
        $matchesStart = !$start || $now->greaterThanOrEqualTo($start);
        $matchesEnd   = !$end || $now->lessThan($end);

        return $matchesStart && $matchesEnd && (float) $salePrice < (float) $regularPrice;
    }

    private function salePriceEffectiveDate(mixed $startDate, mixed $endDate): ?string
    {
        if (!$startDate || !$endDate) {
            return null;
        }

        $start = $startDate instanceof CarbonInterface ? $startDate : \Carbon\Carbon::parse($startDate);
        $end   = $endDate instanceof CarbonInterface ? $endDate : \Carbon\Carbon::parse($endDate);

        return $start->format('Y-m-d\TH:iO') . '/' . $end->format('Y-m-d\TH:iO');
    }

    private function imageUrl(mixed $image): ?string
    {
        if (!$image) {
            return null;
        }

        $type = $image->getAttribute('type');
        if ($type instanceof \BackedEnum) {
            $type = $type->value;
        }

        if (strtolower((string) $type) === 'video') {
            return null;
        }

        // En tus modelos el campo en product_media es 'file_path'
        $url = $image->getAttribute('file_path') ?? $image->getAttribute('url');
        if (!$url) {
            return null;
        }

        if (preg_match('/\.(mp4|mov|avi|webm|ogv)(\?.*)?$/i', (string) $url)) {
            return null;
        }

        return $this->absoluteUrl($url);
    }

    private function imageOnlyCollection(mixed $images): Collection
    {
        $collection = $images instanceof Collection ? $images->values() : collect($images)->values();

        return $collection
            ->filter(fn ($image) => $this->imageUrl($image) !== null)
            ->values();
    }

    private function feedTitle(string $productName, array $attributes, bool $forceSimple = false): string
    {
        if ($forceSimple) {
            return $productName;
        }

        $suffix = collect($attributes)
            ->filter(fn ($a) => filled($a))
            ->reject(fn ($a) => in_array(strtolower(trim((string) $a)), ['pd', 'predeterminado'], true))
            ->unique()
            ->implode(' - ');

        return filled($suffix) ? "{$productName} - {$suffix}" : $productName;
    }

    private function findAttributeValue(ProductVariant $variant, array $keys): ?string
    {
        foreach ($variant->attributes as $attribute) {
            // Asumiendo que attributes tiene alguna relación o campo que indique el tipo/nombre (ej. attribute->name o similar)
            // Si tus atributos guardan la propiedad de qué tipo son, puedes validarlo aquí.
            $attributeName = strtolower($attribute->name ?? '');
            foreach ($keys as $key) {
                if (str_contains($attributeName, $key)) {
                    return $attribute->pivot?->value ?? $attribute->name;
                }
            }
        }

        return null;
    }

    private function resolveFeedId(ProductVariant $variant): string
    {
        foreach (['sku', 'sku_supplier'] as $field) {
            $value = $variant->getAttribute($field);
            if (filled($value)) {
                return (string) $value;
            }
        }

        return (string) $variant->id;
    }

    private function alreadyWritten(string $itemId): bool
    {
        if ($itemId === '') {
            return true;
        }

        if (isset($this->writtenItemIds[$itemId])) {
            return true;
        }

        $this->writtenItemIds[$itemId] = true;

        return false;
    }

    private function normalizeAttribute(mixed $value): ?string
    {
        $value = trim((string) $value);

        if ($value === '' || in_array(strtolower($value), ['pd', 'predeterminado'], true)) {
            return null;
        }

        return $value;
    }

    private function description(?string $description, ?string $briefDescription): string
    {
        return trim(strip_tags($description ?: $briefDescription ?: 'Producto Daryza'));
    }

    private function formatPrice(float $price): string
    {
        return number_format($price, 2, '.', '') . ' ' . self::CURRENCY;
    }

    private function productUrl(string $slug): string
    {
        return $this->siteUrl() . '/producto/' . ltrim($slug, '/');
    }

    private function absoluteUrl(string $url): string
    {
        if (str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
            return $url;
        }

        return $this->siteUrl() . '/' . ltrim($url, '/');
    }

    private function siteUrl(): string
    {
        return rtrim(env('APP_URL_CLIENT', config('app.url')), '/');
    }
}