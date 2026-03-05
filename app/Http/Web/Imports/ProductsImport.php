<?php

namespace App\Http\Web\Imports;

use App\Http\Web\Services\Products\ProductImportService;
use App\Http\Web\Services\Products\ProductImportRowMapper;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Events\AfterImport;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ProductsImport implements ToCollection, WithChunkReading, WithHeadingRow, WithEvents
{
    /**
     * @var array<string, array<int, string>>
     */
    private array $pendingRecommendationsByProductCode = [];

    public function collection(Collection $rows)
    {
        $service = app(ProductImportService::class);
        $mapper = app(ProductImportRowMapper::class);

        // Cache para productos ya creados
        $productsCache = [];
        $lastCode = null;

        foreach ($rows as $rowIndex => $row) {
            $mapped = $mapper->map($row);
            $code = $mapped['product']['code'];
            $name = $mapped['product']['name'];
            $price = $mapped['variant']['price'];
            $sku_daryza = $mapped['variant']['sku_daryza'];
            $parentCategory = $mapped['categories']['parent'] ?? '';
            $childCategories = $mapped['categories']['children'] ?? '';
            $recommendedCodes = $this->parseRecommendedCodes($row);

            // Regla de formato: no se permite subcategoría sin categoría padre.
            if (trim((string) $childCategories) !== '' && trim((string) $parentCategory) === '') {
                Log::warning("Fila {$rowIndex}: sub_categorias informadas sin categoria padre. Fila omitida.", [
                    'codigo' => $code,
                    'nombre' => $name,
                    'sub_categorias' => $childCategories,
                ]);
                continue;
            }

            if (($code === '' || $name === '') && ($sku_daryza !== '' || $price !== null) && !$lastCode) {
                Log::warning("Fila {$rowIndex}: variante sin producto base válido (no hay último código).", [
                    'sku_daryza' => $sku_daryza,
                    'price' => $price,
                ]);
                continue;
            }

            // Si hay código/nombre, actualizar último código válido
            if ($code && $name) {
                $lastCode = $code;

                if (!array_key_exists($code, $this->pendingRecommendationsByProductCode)) {
                    // Permite limpiar recomendaciones cuando la celda viene vacía.
                    $this->pendingRecommendationsByProductCode[$code] = $recommendedCodes;
                } elseif (!empty($recommendedCodes)) {
                    // Si vuelve a aparecer el mismo producto con nuevos códigos, consolidamos.
                    $this->pendingRecommendationsByProductCode[$code] = array_values(
                        array_unique(array_merge(
                            $this->pendingRecommendationsByProductCode[$code],
                            $recommendedCodes
                        ))
                    );
                }

                // Crear producto solo si no existe en cache
                if (!isset($productsCache[$code])) {
                    $product = $service->createProduct($mapped['product']);

                    $service->associateProductCategories(
                        $product,
                        $mapped['categories']['parent'],
                        $mapped['categories']['children']
                    );
                    $service->associateProductBusinessLines($product, $mapped['business_lines']);
                    $productsCache[$code] = $product;
                    Log::info("Producto creado: {$code} - {$name}");
                }
            }

            // Si no hay código/nombre, usar último código válido
            if (!$code || !$name) {
                if (!$lastCode || !isset($productsCache[$lastCode])) {
                    Log::warning("Fila {$rowIndex}: variante sin producto base válido.");
                    continue;
                }
                $code = $lastCode;
            }

            // Tomar el producto correcto desde cache
            $product = $productsCache[$code];

            // Crear variante si hay SKU Daryza y precio
            if ($sku_daryza && $price !== null) {
                $variant = $service->createVariant($product, $mapped['variant']);
                $attributes = $mapped['attributes'];

                if (!empty($attributes)) {
                    $service->associateVariantAttributes($variant, $attributes);
                }

                $specs = $mapped['specifications'];

                if (!empty($specs)) {
                    $service->associateVariantSpecifications($variant, $specs);
                }

                Log::info("Variante creada: SKU {$sku_daryza}, Producto {$product->code}");
            } else {
                Log::warning("Fila {$rowIndex}: variante no creada, SKU o precio inválido.", [
                    'sku_daryza' => $sku_daryza,
                    'price' => $price,
                    'product_code' => $product->code ?? null,
                ]);
            }
        }
    }

    public function registerEvents(): array
    {
        return [
            AfterImport::class => function () {
                $service = app(ProductImportService::class);

                foreach ($this->pendingRecommendationsByProductCode as $productCode => $recommendedCodes) {
                    $service->syncProductRecommendationsByCodes($productCode, $recommendedCodes);
                }
            },
        ];
    }

    public function chunkSize(): int
    {
        return 300;
    }

    public function headingRow(): int
    {
        return 1;
    }

    /**
     * @param  array<string, mixed>|Collection<string, mixed>  $row
     * @return array<int, string>
     */
    private function parseRecommendedCodes($row): array
    {
        $raw = '';

        $candidates = [
            'productos_recomendados',
            'productos recomendados',
            'recomendados',
        ];

        foreach ($candidates as $key) {
            $value = $row[$key] ?? null;
            if (is_string($value) && trim($value) !== '') {
                $raw = $value;
                break;
            }
        }

        if ($raw === '') {
            return [];
        }

        return collect(explode(',', $raw))
            ->map(fn($item) => trim($item))
            ->filter()
            ->unique()
            ->values()
            ->all();
    }
}
