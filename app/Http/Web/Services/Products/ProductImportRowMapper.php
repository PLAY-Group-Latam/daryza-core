<?php

namespace App\Http\Web\Services\Products;

use Carbon\Carbon;
use Illuminate\Support\Collection;

class ProductImportRowMapper
{
    public const HEADER_CODE = 'codigo';
    public const HEADER_NAME = 'nombre';
    public const HEADER_BRIEF = 'descripcion_corta';
    public const HEADER_DESCRIPTION = 'descripcion';
    public const HEADER_PRICE = 'precio';
    public const HEADER_PRESENTATION = 'presentacion';
    public const HEADER_AROMA = 'aroma';
    public const HEADER_COLOR = 'color';
    public const HEADER_SIZE = 'talla';
    public const HEADER_SKU_SUPPLIER = 'sku_proveedor';
    public const HEADER_SKU_DARYZA = 'sku_daryza';
    public const HEADER_BRAND = 'marca';
    public const HEADER_STOCK = 'inventario';
    public const HEADER_AVAILABILITY = 'disponibilidad_catalogo';
    public const HEADER_WEIGHT = 'peso_kg';
    public const HEADER_HEIGHT = 'alto_cm';
    public const HEADER_LENGTH = 'largo_cm';
    public const HEADER_WIDTH = 'ancho_cm';
    public const HEADER_VOLUME = 'volumen_cm';
    public const HEADER_PROMO_PRICE = 'precio_oferta';
    public const HEADER_PROMO_START = 'inicio_precio_oferta';
    public const HEADER_PROMO_END = 'fin_precio_oferta';
    public const HEADER_BUSINESS_LINE = 'linea_de_negocio';
    public const HEADER_CATEGORY = 'categorias';
    public const HEADER_SUBCATEGORY = 'sub_categorias';

    /**
     * @param array<string, mixed>|Collection<string, mixed> $row
     * @return array<string, mixed>
     */
    public function map(array|Collection $row): array
    {
        $get = fn(string $key): mixed => is_array($row) ? ($row[$key] ?? null) : $row->get($key);
        $code = $this->normalizeText($get(self::HEADER_CODE));
        $name = $this->normalizeText($get(self::HEADER_NAME));

        $price = $this->normalizeDecimal($get(self::HEADER_PRICE));
        $promoPrice = $this->normalizeDecimal($get(self::HEADER_PROMO_PRICE));
        $promoStartRaw = $get(self::HEADER_PROMO_START);
        $promoEndRaw = $get(self::HEADER_PROMO_END);
        $promoStart = $this->transformDate($promoStartRaw);
        $promoEnd = $this->transformDate($promoEndRaw);

        $availability = strtoupper($this->normalizeText($get(self::HEADER_AVAILABILITY)));
        $isActive = ($availability === 'D');

        return [
            'product' => [
                'code' => $code,
                'name' => $name,
                'brief_description' => $this->normalizeText($get(self::HEADER_BRIEF)),
                'description' => $this->normalizeText($get(self::HEADER_DESCRIPTION)),
                'brand' => $this->normalizeText($get(self::HEADER_BRAND)),
                'is_active' => $isActive,
                'is_home' => false,
            ],
            'variant' => [
                'sku_supplier' => $this->nullableText($get(self::HEADER_SKU_SUPPLIER)),
                'sku_daryza' => $this->normalizeText($get(self::HEADER_SKU_DARYZA)),
                'price' => $price,
                'promo_price' => $promoPrice,
                'is_on_promo' => $promoPrice !== null && $promoPrice > 0,
                'promo_start_at' => $promoStart,
                'promo_end_at' => $promoEnd,
                'promo_start_raw' => $promoStartRaw,
                'promo_end_raw' => $promoEndRaw,
                'stock' => (int) ($get(self::HEADER_STOCK) ?? 0),
                'is_active' => $isActive,
            ],
            'attributes' => array_filter([
                'Presentación' => $this->normalizeText($get(self::HEADER_PRESENTATION)),
                'Aroma' => $this->normalizeText($get(self::HEADER_AROMA)),
                'Color' => $this->normalizeText($get(self::HEADER_COLOR)),
                'Talla' => $this->normalizeText($get(self::HEADER_SIZE)),
            ], fn($value) => $value !== ''),
            'specifications' => array_filter([
                'Marca' => $this->normalizeText($get(self::HEADER_BRAND)),
                'Peso' => $this->appendUnit($get(self::HEADER_WEIGHT), 'kg'),
                'Alto' => $this->appendUnit($get(self::HEADER_HEIGHT), 'cm'),
                'Largo' => $this->appendUnit($get(self::HEADER_LENGTH), 'cm'),
                'Ancho' => $this->appendUnit($get(self::HEADER_WIDTH), 'cm'),
                'Volumen' => $this->appendUnit($get(self::HEADER_VOLUME), 'cm'),
            ], fn($value) => $value !== null && $value !== ''),
            'categories' => [
                'parent' => $this->normalizeText($get(self::HEADER_CATEGORY)),
                'children' => $this->normalizeText($get(self::HEADER_SUBCATEGORY)),
            ],
            'business_lines' => $this->normalizeText($get(self::HEADER_BUSINESS_LINE)),
        ];
    }

    private function normalizeText(mixed $value): string
    {
        return trim((string) ($value ?? ''));
    }

    private function nullableText(mixed $value): ?string
    {
        $normalized = $this->normalizeText($value);
        return $normalized !== '' ? $normalized : null;
    }

    private function normalizeDecimal(mixed $value): ?float
    {
        $raw = $this->normalizeText($value);
        if ($raw === '') {
            return null;
        }

        return (float) str_replace(',', '.', $raw);
    }

    private function appendUnit(mixed $value, string $unit): ?string
    {
        $raw = $this->normalizeText($value);
        if ($raw === '') {
            return null;
        }

        return $raw . ' ' . $unit;
    }

    private function transformDate(mixed $value): ?Carbon
    {
        if ($value === null || $value === '') {
            return null;
        }

        try {
            if (is_numeric($value)) {
                return Carbon::instance(\PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject((float) $value))
                    ->setTime(12, 0, 0);
            }

            $raw = trim((string) $value);
            if ($raw === '') {
                return null;
            }

            $formats = ['d/m/Y', 'd-m-Y'];
            foreach ($formats as $format) {
                $parsed = Carbon::createFromFormat($format, $raw);
                if ($parsed !== false) {
                    return $parsed->setTime(12, 0, 0);
                }
            }

            return null;
        } catch (\Throwable) {
            return null;
        }
    }
}
