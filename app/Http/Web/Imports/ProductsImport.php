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
    public function __construct(
        private readonly bool $dryRun = false
    ) {}

    /**
     * @var array<string, array<int, string>>
     */
    private array $pendingRecommendationsByProductCode = [];
    private array $summary = [
        'total' => 0,
        'processed' => 0,
        'failed' => 0,
        'dry_run' => false,
        'products_created' => 0,
        'products_updated' => 0,
        'products_unchanged' => 0,
        'variants_created' => 0,
        'variants_updated' => 0,
        'variants_unchanged' => 0,
    ];
    /**
     * @var array<int, string>
     */
    private array $rowErrors = [];

    public function collection(Collection $rows)
    {
        $this->summary['dry_run'] = $this->dryRun;

        $service = app(ProductImportService::class);
        $mapper = app(ProductImportRowMapper::class);

        // Cache para productos ya creados
        $productsCache = [];
        $lastCode = null;

        foreach ($rows as $row) {
            $this->summary['total']++;
            $excelRow = $this->summary['total'] + 1; // +1 por la cabecera

            $mapped = $mapper->map($row);
            $code = $mapped['product']['code'];
            $name = $mapped['product']['name'];
            $price = $mapped['variant']['price'];
            $sku_daryza = $mapped['variant']['sku_daryza'];
            $parentCategory = $mapped['categories']['parent'] ?? '';
            $childCategories = $mapped['categories']['children'] ?? '';
            $recommendedCodes = $this->parseRecommendedCodes($row);

            $rowValidationErrors = $this->validateMappedRow($mapped, $lastCode);
            if (!empty($rowValidationErrors)) {
                foreach ($rowValidationErrors as $errorMessage) {
                    $this->registerRowError($excelRow, $errorMessage, [
                        'codigo' => $code,
                        'nombre' => $name,
                    ]);
                }
                continue;
            }

            // Regla de formato: no se permite subcategoría sin categoría padre.
            if (trim((string) $childCategories) !== '' && trim((string) $parentCategory) === '') {
                $this->registerRowError($excelRow, 'Subcategorías informadas sin categoría padre.', [
                    'codigo' => $code,
                    'nombre' => $name,
                    'sub_categorias' => $childCategories,
                ]);
                continue;
            }

            if (($code === '' || $name === '') && ($sku_daryza !== '' || $price !== null) && !$lastCode) {
                $this->registerRowError($excelRow, 'Variante sin producto base válido (no hay último código).', [
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
                    if ($this->dryRun) {
                        $productsCache[$code] = ['id' => $code];
                    } else {
                        $productStatus = null;
                        $product = $service->createProduct($mapped['product'], $productStatus);

                        $service->associateProductCategories(
                            $product,
                            $mapped['categories']['parent'],
                            $mapped['categories']['children']
                        );
                        $service->associateProductBusinessLines($product, $mapped['business_lines']);
                        $productsCache[$code] = $product;
                        $this->bumpSummaryStatus('products', $productStatus);
                        Log::info("Producto procesado: {$code} - {$name}", ['status' => $productStatus]);
                    }
                }
            }

            // Si no hay código/nombre, usar último código válido
            if (!$code || !$name) {
                if (!$lastCode || !isset($productsCache[$lastCode])) {
                    $this->registerRowError($excelRow, 'Variante sin producto base válido.');
                    continue;
                }
                $code = $lastCode;
            }

            if ($this->dryRun) {
                $this->summary['processed']++;
                continue;
            }

            // Tomar el producto correcto desde cache
            $product = $productsCache[$code];

            $isSingleProductRow = empty($mapped['attributes']);

            if ($isSingleProductRow) {
                $variantStatus = null;
                $variant = $service->createOrUpdateSingleVariant($product, $mapped['variant'], $variantStatus);
                $this->bumpSummaryStatus('variants', $variantStatus);

                $specs = $mapped['specifications'];
                if (!empty($specs)) {
                    $service->associateVariantSpecifications($variant, $specs);
                }

                $this->summary['processed']++;
                Log::info("Producto único importado/actualizado: {$product->code}, Variante {$variant->sku}", [
                    'status' => $variantStatus,
                ]);
                continue;
            }

            // Crear variante si hay SKU Daryza y precio
            if ($sku_daryza && $price !== null) {
                $variantStatus = null;
                $variant = $service->createVariant($product, $mapped['variant'], $variantStatus);
                $this->bumpSummaryStatus('variants', $variantStatus);
                $attributes = $mapped['attributes'];

                if (!empty($attributes)) {
                    $service->associateVariantAttributes($variant, $attributes);
                }

                $specs = $mapped['specifications'];

                if (!empty($specs)) {
                    $service->associateVariantSpecifications($variant, $specs);
                }

                $this->summary['processed']++;
                Log::info("Variante procesada: SKU {$sku_daryza}, Producto {$product->code}", [
                    'status' => $variantStatus,
                ]);
            } else {
                $this->registerRowError($excelRow, 'Variante no creada: SKU o precio inválido.', [
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
                if ($this->dryRun) {
                    return;
                }

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
     * @return array<string, mixed>
     */
    public function getSummary(): array
    {
        return [
            ...$this->summary,
            'errors' => $this->rowErrors,
        ];
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

    /**
     * @param array<string, mixed> $mapped
     * @return array<int, string>
     */
    private function validateMappedRow(array $mapped, ?string $lastCode): array
    {
        $errors = [];

        $code = trim((string) ($mapped['product']['code'] ?? ''));
        $name = trim((string) ($mapped['product']['name'] ?? ''));
        $sku = trim((string) ($mapped['variant']['sku_daryza'] ?? ''));
        $price = $mapped['variant']['price'] ?? null;
        $childCategories = trim((string) ($mapped['categories']['children'] ?? ''));
        $parentCategory = trim((string) ($mapped['categories']['parent'] ?? ''));
        $hasAttributes = !empty($mapped['attributes']);

        if (($code === '' xor $name === '')) {
            $errors[] = 'Código y nombre deben venir juntos, o ambos vacíos para continuar con el último producto.';
        }

        if ($childCategories !== '' && $parentCategory === '') {
            $errors[] = 'Hay subcategorías informadas, pero falta la categoría padre.';
        }

        if (($code === '' || $name === '') && $sku !== '' && !$lastCode) {
            $errors[] = 'La fila trae variante, pero no hay producto base previo válido.';
        }

        if ($hasAttributes) {
            if ($sku === '') {
                $errors[] = 'Falta SKU Daryza para una variante configurable.';
            }

            if (!is_numeric($price)) {
                $errors[] = 'Falta precio válido para una variante configurable.';
            } elseif ((float) $price < 0) {
                $errors[] = 'El precio no puede ser negativo.';
            }
        }

        return $errors;
    }

    /**
     * @param array<string, mixed> $context
     */
    private function registerRowError(int $excelRow, string $message, array $context = []): void
    {
        $this->summary['failed']++;

        $line = "Fila {$excelRow}: {$message}";
        $this->rowErrors[] = $line;
        if (count($this->rowErrors) > 100) {
            array_shift($this->rowErrors);
        }

        Log::warning($line, $context);
    }

    private function bumpSummaryStatus(string $entity, ?string $status): void
    {
        $normalized = in_array($status, ['created', 'updated', 'unchanged'], true)
            ? $status
            : 'updated';

        $key = "{$entity}_{$normalized}";
        if (array_key_exists($key, $this->summary)) {
            $this->summary[$key]++;
        }
    }
}
