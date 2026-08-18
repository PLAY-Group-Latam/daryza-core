<?php

namespace App\Http\Web\Imports;

use App\Http\Web\Services\Products\ProductImportService;
use App\Http\Web\Services\Products\ProductImportRowMapper;
use App\Models\Products\Product;
use App\Models\Products\ProductImportSession;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Events\AfterImport;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithStartRow;

class ProductsImport implements ToCollection, WithChunkReading, WithHeadingRow, WithEvents, WithStartRow
{
    private const CANCELLED_EXCEPTION_MARKER = '__PRODUCT_IMPORT_CANCELLED__';
    public function __construct(
        private readonly bool $dryRun = false,
        private readonly ?string $importSessionId = null,
        private readonly int $resumeFromDataRow = 1
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
        'products_parent_without_variants' => 0,
        'variants_without_attributes' => 0,
        'sku_duplicates' => 0,
    ];
    /**
     * @var array<int, string>
     */
    private array $rowErrors = [];

    /**
     * @var array<int, array{row: int, message: string, field: string, value: string, context: array<string, mixed>}>
     */
    private array $rowErrorDetails = [];

    /**
     * @var array<string, int>
     */
    private array $columnErrorCounts = [];

    /**
     * @var array<string, array{row: int, context: array<string, mixed>, raw_row: array|Collection}>
     */
    private array $pendingHeaderRows = [];

    /**
     * @var array<string, array{row: int, product_id: string|null, product_code: string, variant: array, raw_row: array|Collection}>
     */
    private array $pendingSingleVariantRows = [];

    /**
     * @var array<string, bool>
     */
    private array $variantsCreatedByCode = [];

    /**
     * @var array<string, bool>
     */
    private array $variantsIntendedByCode = [];

    /**
     * @var array<string, array{row: int, code: string, sku: string}>
     */
    private array $seenSkus = [];

    /**
     * Estado entre chunks: último código válido procesado.
     */
    private ?string $lastCode = null;

    /**
     * Cache de productos ya resueltos/creados durante toda la importación.
     *
     * @var array<string, mixed>
     */
    private array $productsCache = [];
    /**
     * @var array<string, string|null>
     */
    private array $productIdByCodeCache = [];
    /**
     * @var array<string, string>
     */
    private array $canonicalBrandByCode = [];
    private int $lastProgressPersistedAt = 0;
    private int $processedOffset = 0;

    /**
     * @return array{code: string, name: string, has_sku: bool, has_price: bool, has_attributes: bool, has_variant_signal: bool, sku_normalized: string}
     */
    private function buildRowContext(array $mapped): array
    {
        $code = $mapped['product']['code'] ?? '';
        $name = $mapped['product']['name'] ?? '';
        $sku = $mapped['variant']['sku_daryza'] ?? '';
        $price = $mapped['variant']['price'] ?? null;
        $hasAttributes = !empty($mapped['attributes']);
        $hasSku = trim((string) $sku) !== '';
        $hasPrice = $price !== null;

        return [
            'code' => $code,
            'name' => $name,
            'has_sku' => $hasSku,
            'has_price' => $hasPrice,
            'has_attributes' => $hasAttributes,
            'has_variant_signal' => $hasAttributes || $hasSku || $hasPrice,
            'sku_normalized' => strtoupper(trim((string) $sku)),
        ];
    }

    private function shouldDeferHeaderRow(array $ctx, bool $hasValidCode): bool
    {
        return $hasValidCode && !$ctx['has_variant_signal'];
    }

    private function shouldCreateVariant(array $ctx): bool
    {
        return $ctx['has_sku'] && $ctx['has_price'];
    }

    private function validateVariantRequirements(
        int $excelRow,
        array $mapped,
        array $ctx,
        array|Collection $row
    ): bool {
        if ($ctx['has_attributes'] && (!$ctx['has_sku'] || !$ctx['has_price'])) {
            $this->registerRowError(
                $excelRow,
                'Falta SKU o precio para una variante con atributos.',
                [
                    'sku_daryza' => $mapped['variant']['sku_daryza'] ?? '',
                    'price' => $mapped['variant']['price'] ?? null,
                ],
                [ProductImportRowMapper::HEADER_SKU_DARYZA, ProductImportRowMapper::HEADER_PRICE],
                $row
            );
            return false;
        }

        if ($ctx['has_sku'] && !$ctx['has_price']) {
            $this->registerRowError(
                $excelRow,
                'Falta precio para la variante.',
                [
                    'sku_daryza' => $mapped['variant']['sku_daryza'] ?? '',
                    'price' => $mapped['variant']['price'] ?? null,
                ],
                [ProductImportRowMapper::HEADER_PRICE],
                $row
            );
            return false;
        }

        return true;
    }

    private function isRowEmpty(array|Collection $row): bool
    {
        $values = is_array($row) ? $row : $row->toArray();

        foreach ($values as $value) {
            if (is_numeric($value)) {
                return false;
            }
            if (is_string($value) && trim($value) !== '') {
                return false;
            }
            if ($value !== null && $value !== '') {
                return false;
            }
        }

        return true;
    }

    public function collection(Collection $rows)
    {
        $this->summary['dry_run'] = $this->dryRun;
        $this->processedOffset = max(0, $this->resumeFromDataRow - 1);

        $service = app(ProductImportService::class);
        $mapper = app(ProductImportRowMapper::class);

        foreach ($rows as $row) {
            $this->summary['total']++;
            $excelRow = $this->summary['total'] + 1; // +1 por la cabecera
            $this->persistProgressIfNeeded();

            if ($this->isRowEmpty($row)) {
                continue;
            }

            $mapped = $mapper->map($row);
            $originalCode = $mapped['product']['code'];
            $originalName = $mapped['product']['name'];
            $code = $originalCode;
            $name = $originalName;
            $price = $mapped['variant']['price'];
            $sku_daryza = $mapped['variant']['sku_daryza'];
            $parentCategory = $mapped['categories']['parent'] ?? '';
            $childCategories = $mapped['categories']['children'] ?? '';
            $recommendedCodes = $this->parseRecommendedCodes($row);
            $ctx = $this->buildRowContext($mapped);

            // Marca canónica por producto: la primera no vacía del bloque se replica
            // a todas las variantes para persistir especificación real "Marca".
            $currentBrand = trim((string) ($mapped['product']['brand'] ?? ''));
            $brandOwnerCode = $code ?: $this->lastCode;
            if ($brandOwnerCode) {
                if ($currentBrand !== '') {
                    if (!isset($this->canonicalBrandByCode[$brandOwnerCode])) {
                        $this->canonicalBrandByCode[$brandOwnerCode] = $currentBrand;
                    }
                }

                $canonicalBrand = $this->canonicalBrandByCode[$brandOwnerCode] ?? '';
                if ($canonicalBrand !== '') {
                    $mapped['product']['brand'] = $canonicalBrand;
                    $mapped['specifications']['Marca'] = $canonicalBrand;
                }
            }


            $rowValidationErrors = $this->validateMappedRow($mapped, $this->lastCode);
            if (!empty($rowValidationErrors)) {
                foreach ($rowValidationErrors as $error) {
                    $this->registerRowError(
                        $excelRow,
                        $error['message'],
                        [
                            'codigo' => $code,
                            'nombre' => $name,
                        ],
                        $error['columns'] ?? [],
                        $row
                    );
                }
                continue;
            }

            // Regla de formato: no se permite subcategoría sin categoría padre.
            if (trim((string) $childCategories) !== '' && trim((string) $parentCategory) === '') {
                $this->registerRowError(
                    $excelRow,
                    'Subcategorías informadas sin categoría padre.',
                    [
                        'codigo' => $code,
                        'nombre' => $name,
                        'sub_categorias' => $childCategories,
                    ],
                    [ProductImportRowMapper::HEADER_SUBCATEGORY, ProductImportRowMapper::HEADER_CATEGORY],
                    $row
                );
                continue;
            }

            if (($code === '' || $name === '') && ($sku_daryza !== '' || $price !== null) && !$this->lastCode) {
                $this->registerRowError(
                    $excelRow,
                    'Variante sin producto base válido (no hay último código).',
                    [
                        'sku_daryza' => $sku_daryza,
                        'price' => $price,
                    ],
                    [ProductImportRowMapper::HEADER_SKU_DARYZA, ProductImportRowMapper::HEADER_PRICE],
                    $row
                );
                continue;
            }

            // Si hay código/nombre, actualizar último código válido
            if ($code && $name) {
                $this->lastCode = $code;

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
                if (!isset($this->productsCache[$code])) {
                    if ($this->dryRun) {
                        $existingProductId = $this->resolveProductIdByCode($code);
                        $this->productsCache[$code] = ['id' => $existingProductId ?: $code];
                        $this->trackProductCode($code, $existingProductId);
                    } else {
                        $productData = $this->runTransactionalWithRowError(
                            fn() => DB::transaction(function () use ($service, $mapped, $code, $name) {
                                $productStatus = null;
                                $product = $service->createProduct($mapped['product'], $productStatus);

                                $service->associateProductCategories(
                                    $product,
                                    $mapped['categories']['parent'],
                                    $mapped['categories']['children']
                                );
                                $service->associateProductBusinessLines($product, $mapped['business_lines']);

                                Log::info("Producto procesado: {$code} - {$name}", ['status' => $productStatus]);

                                return [
                                    'product' => $product,
                                    'status' => $productStatus,
                                ];
                            }),
                            $excelRow,
                            'Error guardando datos del producto. Se revirtio la fila.',
                            [
                                'codigo' => $code,
                                'nombre' => $name,
                            ],
                            [
                                ProductImportRowMapper::HEADER_CODE,
                                ProductImportRowMapper::HEADER_NAME,
                            ],
                            $row
                        );

                        if ($productData === null) {
                            continue;
                        }

                        $product = $productData['product'];
                        $productStatus = $productData['status'];
                        $this->productsCache[$code] = $product;
                        $this->trackProductCode($code, $product->id);
                        $this->bumpSummaryStatus('products', $productStatus);
                    }
                }
            }

            // Si no hay código/nombre, usar último código válido
            if (!$code || !$name) {
                if (!$this->lastCode || !isset($this->productsCache[$this->lastCode])) {
                    $this->registerRowError(
                        $excelRow,
                        'Variante sin producto base válido.',
                        [],
                        [ProductImportRowMapper::HEADER_SKU_DARYZA, ProductImportRowMapper::HEADER_CODE],
                        $row
                    );
                    continue;
                }
                $code = $this->lastCode;
            }

            $product = null;
            $productId = null;
            if ($this->dryRun) {
                $productId = $this->resolveProductIdByCode($code);
            } else {
                // Tomar el producto correcto desde cache
                $product = $this->productsCache[$code];
                $productId = (string) ($product->id ?? '');
                if ($productId === '') {
                    $productId = null;
                }
            }

            if ($ctx['has_sku']) {
                if (isset($this->seenSkus[$ctx['sku_normalized']])) {
                    $previous = $this->seenSkus[$ctx['sku_normalized']];
                    $this->summary['sku_duplicates']++;
                    $this->registerRowError(
                        $excelRow,
                        "SKU duplicado. Ya se uso en la fila {$previous['row']}.",
                        [
                            'codigo' => $code,
                            'sku_daryza' => $sku_daryza,
                        ],
                        [ProductImportRowMapper::HEADER_SKU_DARYZA],
                        $row
                    );
                    continue;
                }
                $this->seenSkus[$ctx['sku_normalized']] = [
                    'row' => $excelRow,
                    'code' => $code,
                    'sku' => $sku_daryza,
                ];
            }

            if ($ctx['has_sku']) {
                $skuConflict = $productId
                    ? $service->findGlobalSkuConflict($sku_daryza, $productId)
                    : $service->findSku($sku_daryza);

                if ($skuConflict) {
                    $this->summary['sku_duplicates']++;
                    $this->registerRowError(
                        $excelRow,
                        'SKU duplicado contra otro producto existente. Corrige el SKU en el Excel.',
                        [
                            'codigo' => $code,
                            'sku_daryza' => $sku_daryza,
                            'producto_conflicto_id' => $skuConflict->product_id,
                            'variante_conflicto_id' => $skuConflict->id,
                        ],
                        [ProductImportRowMapper::HEADER_SKU_DARYZA],
                        $row
                    );
                    continue;
                }
            }

            $hasValidCode = $code && $name;
            if ($this->shouldDeferHeaderRow($ctx, $hasValidCode)) {
                $this->pendingHeaderRows[$code] = [
                    'row' => $excelRow,
                    'context' => [
                        'codigo' => $code,
                        'nombre' => $name,
                    ],
                    'raw_row' => $row,
                ];
                continue;
            }

            if (!$this->validateVariantRequirements($excelRow, $mapped, $ctx, $row)) {
                continue;
            }

            if ($this->dryRun) {
                $this->summary['processed']++;
                continue;
            }

            if (
                ($originalCode === '' || $originalName === '')
                && !$ctx['has_attributes']
                && $ctx['has_sku']
                && $ctx['has_price']
            ) {
                $this->registerRowError(
                    $excelRow,
                    'Fila hija con SKU/precio pero sin atributos de variante. Completa Presentación/Aroma/Color/Talla.',
                    [
                        'codigo_base' => $code,
                        'sku_daryza' => $sku_daryza,
                    ],
                    [
                        ProductImportRowMapper::HEADER_PRESENTATION,
                        ProductImportRowMapper::HEADER_AROMA,
                        ProductImportRowMapper::HEADER_COLOR,
                        ProductImportRowMapper::HEADER_SIZE,
                    ],
                    $row
                );
                continue;
            }

            if (!$ctx['has_attributes'] && !$ctx['has_sku'] && $ctx['has_price']) {
                $this->registerRowError(
                    $excelRow,
                    'Falta SKU Daryza para el producto.',
                    [
                        'codigo' => $product->code,
                        'price' => $price,
                    ],
                    [ProductImportRowMapper::HEADER_SKU_DARYZA],
                    $row
                );
                continue;
            }

            if (!$ctx['has_attributes'] && $ctx['has_sku'] && $ctx['has_price']) {
                if (isset($this->pendingSingleVariantRows[$product->code]) || ($this->variantsIntendedByCode[$product->code] ?? false)) {
                    $this->registerRowError(
                        $excelRow,
                        'SKU Daryza repetido para producto simple con multiples filas.',
                        [
                            'codigo' => $product->code,
                            'sku_daryza' => $sku_daryza,
                        ],
                        [ProductImportRowMapper::HEADER_SKU_DARYZA],
                        $row
                    );
                    continue;
                }

                // Primer registro válido de producto simple: marcamos intención y
                // posponemos la creación para confirmar que no vengan más filas simples del mismo código.
                $this->variantsIntendedByCode[$product->code] = true;
                unset($this->pendingHeaderRows[$product->code]);

                $this->pendingSingleVariantRows[$product->code] = [
                    'row' => $excelRow,
                    'product_id' => is_object($product) ? $product->id : null,
                    'product_code' => $product->code ?? (string) $code,
                    'variant' => $mapped['variant'],
                    'specifications' => $mapped['specifications'] ?? [],
                    'raw_row' => $row,
                ];
                $this->summary['processed']++;
                continue;
            }

            if ($ctx['has_sku'] && $code) {
                $this->variantsIntendedByCode[$code] = true;
                unset($this->pendingHeaderRows[$code]);
            }

            // Crear variante si hay SKU Daryza y precio (con o sin atributos)
            if ($this->shouldCreateVariant($ctx)) {
                $variantData = $this->runTransactionalWithRowError(
                    fn() => DB::transaction(function () use ($service, $product, $mapped, $ctx, $sku_daryza) {
                        $variantStatus = null;
                        $variant = $service->createVariant($product, $mapped['variant'], $variantStatus);

                        $attributes = $mapped['attributes'];
                        if (!empty($attributes)) {
                            $service->associateVariantAttributes($variant, $attributes);
                        }

                        $specs = $mapped['specifications'];
                        if (!empty($specs)) {
                            $service->associateVariantSpecifications($variant, $specs);
                        }

                        Log::info("Variante procesada: SKU {$sku_daryza}, Producto {$product->code}", [
                            'status' => $variantStatus,
                        ]);

                        return [
                            'status' => $variantStatus,
                            'without_attributes' => !$ctx['has_attributes'],
                        ];
                    }),
                    $excelRow,
                    'Error guardando datos de variante. Se revirtio la fila.',
                    [
                        'codigo' => $product->code ?? $code,
                        'sku_daryza' => $sku_daryza,
                    ],
                    [
                        ProductImportRowMapper::HEADER_SKU_DARYZA,
                        ProductImportRowMapper::HEADER_PRICE,
                    ],
                    $row
                );

                if ($variantData === null) {
                    continue;
                }

                $variantStatus = $variantData['status'];
                $this->bumpSummaryStatus('variants', $variantStatus);
                $this->variantsCreatedByCode[$product->code] = true;
                if ($variantData['without_attributes']) {
                    $this->summary['variants_without_attributes']++;
                }
                $this->summary['processed']++;
            } else {
                $this->registerRowError(
                    $excelRow,
                    'Variante no creada: SKU o precio inválido.',
                    [
                        'sku_daryza' => $sku_daryza,
                        'price' => $price,
                        'product_code' => $product->code ?? null,
                    ],
                    [ProductImportRowMapper::HEADER_SKU_DARYZA, ProductImportRowMapper::HEADER_PRICE],
                    $row
                );
            }
        }
    }

    public function registerEvents(): array
    {
        return [
            AfterImport::class => function () {
                $this->processPendingHeaderRows();
                $this->processPendingSingleVariantRows();

                if ($this->dryRun) {
                    return;
                }
                $service = app(ProductImportService::class);

                foreach ($this->pendingRecommendationsByProductCode as $productCode => $recommendedCodes) {
                    $this->runTransactionalWithWarning(
                        fn() => DB::transaction(function () use ($service, $productCode, $recommendedCodes) {
                            $service->syncProductRecommendationsByCodes($productCode, $recommendedCodes);
                        }),
                        'No se pudo sincronizar recomendaciones del producto en importacion',
                        [
                            'product_code' => $productCode,
                        ]
                    );
                }
            },
        ];
    }

    public function chunkSize(): int
    {
        return 100;
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
        $globalProcessed = $this->processedOffset + (int) ($this->summary['total'] ?? 0);

        return [
            ...$this->summary,
            'processed_global' => $globalProcessed,
            'errors' => $this->rowErrors,
            'error_details' => $this->rowErrorDetails,
            'error_columns' => $this->formatColumnErrors(),
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
     * @return array<int, array{message: string, columns: array<int, string>}>
     */
    private function validateMappedRow(array $mapped, ?string $lastCode): array
    {
        $errors = [];

        $code = trim((string) ($mapped['product']['code'] ?? ''));
        $name = trim((string) ($mapped['product']['name'] ?? ''));
        $sku = trim((string) ($mapped['variant']['sku_daryza'] ?? ''));
        $price = $mapped['variant']['price'] ?? null;
        $promoStartAt = $mapped['variant']['promo_start_at'] ?? null;
        $promoEndAt = $mapped['variant']['promo_end_at'] ?? null;
        $promoStartRaw = trim((string) ($mapped['variant']['promo_start_raw'] ?? ''));
        $promoEndRaw = trim((string) ($mapped['variant']['promo_end_raw'] ?? ''));
        $childCategories = trim((string) ($mapped['categories']['children'] ?? ''));
        $parentCategory = trim((string) ($mapped['categories']['parent'] ?? ''));
        $hasAttributes = !empty($mapped['attributes']);

        if (($code === '' xor $name === '')) {
            $errors[] = [
                'message' => 'Código y nombre deben venir juntos, o ambos vacíos para continuar con el último producto.',
                'columns' => [ProductImportRowMapper::HEADER_CODE, ProductImportRowMapper::HEADER_NAME],
            ];
        }

        if ($childCategories !== '' && $parentCategory === '') {
            $errors[] = [
                'message' => 'Tienes subcategorías, pero falta la categoría principal.',
                'columns' => [ProductImportRowMapper::HEADER_SUBCATEGORY, ProductImportRowMapper::HEADER_CATEGORY],
            ];
        }

        if (($code === '' || $name === '') && $sku !== '' && !$lastCode) {
            $errors[] = [
                'message' => 'La fila trae variante, pero no hay producto base previo válido.',
                'columns' => [ProductImportRowMapper::HEADER_SKU_DARYZA, ProductImportRowMapper::HEADER_CODE],
            ];
        }

        if ($hasAttributes) {
            if ($sku === '') {
                $errors[] = [
                    'message' => 'Falta SKU Daryza para una variante configurable.',
                    'columns' => [ProductImportRowMapper::HEADER_SKU_DARYZA],
                ];
            }

            if (!is_numeric($price)) {
                $errors[] = [
                    'message' => 'Falta precio válido para una variante configurable.',
                    'columns' => [ProductImportRowMapper::HEADER_PRICE],
                ];
            } elseif ((float) $price < 0) {
                $errors[] = [
                    'message' => 'El precio no puede ser negativo.',
                    'columns' => [ProductImportRowMapper::HEADER_PRICE],
                ];
            }
        }

        if ($promoStartRaw !== '' && $promoStartAt === null) {
            $errors[] = [
                'message' => 'La fecha de inicio de oferta debe estar en formato DD/MM/AAAA.',
                'columns' => [ProductImportRowMapper::HEADER_PROMO_START],
            ];
        }

        if ($promoEndRaw !== '' && $promoEndAt === null) {
            $errors[] = [
                'message' => 'La fecha de fin de oferta debe estar en formato DD/MM/AAAA.',
                'columns' => [ProductImportRowMapper::HEADER_PROMO_END],
            ];
        }

        return $errors;
    }

    /**
     * @param array<string, mixed> $context
     */
    private function registerRowError(
        int $excelRow,
        string $message,
        array $context = [],
        array $columns = [],
        array|Collection|null $row = null
    ): void {
        $this->summary['failed']++;

        $line = "Fila {$excelRow}: {$message}";
        $this->rowErrors[] = $line;

        $normalizedColumns = array_values(array_filter(array_map('strval', $columns)));
        if (!empty($normalizedColumns)) {
            foreach ($normalizedColumns as $column) {
                $this->columnErrorCounts[$column] = ($this->columnErrorCounts[$column] ?? 0) + 1;
            }
        }

        $field = $normalizedColumns[0] ?? 'sin_columna';
        $value = $this->resolveRowValue($row, $field, $normalizedColumns);

        $this->rowErrorDetails[] = [
            'row' => $excelRow,
            'message' => $message,
            'field' => $field,
            'value' => $value,
            'context' => $context,
        ];

        Log::warning($line, $context);
        $this->persistProgressIfNeeded(true);
    }

    private function persistProgressIfNeeded(bool $force = false): void
    {
        if (!$this->importSessionId) {
            return;
        }

        $current = (int) ($this->summary['total'] ?? 0);
        if (!$force && ($current - $this->lastProgressPersistedAt) < 25) {
            return;
        }

        $failed = (int) ($this->summary['failed'] ?? 0);
        $globalProcessed = $this->processedOffset + $current;
        $session = ProductImportSession::query()
            ->select(['id', 'total_rows', 'status'])
            ->find($this->importSessionId);

        if (!$session) {
            return;
        }

        if ((string) $session->status === 'cancelled') {
            throw new \RuntimeException(self::CANCELLED_EXCEPTION_MARKER);
        }

        $totalRows = (int) ($session->total_rows ?? 0);
        $progress = $totalRows > 0
            ? min(99, (int) floor(($globalProcessed / max(1, $totalRows)) * 100))
            : max(1, min(99, (int) floor($current / 10)));

        ProductImportSession::query()
            ->whereKey($this->importSessionId)
            ->update([
                'processed_rows' => $globalProcessed,
                'failed_rows' => $failed,
                'progress_percent' => $progress,
            ]);

        $this->lastProgressPersistedAt = $current;
    }

    public static function cancellationExceptionMarker(): string
    {
        return self::CANCELLED_EXCEPTION_MARKER;
    }

    public function startRow(): int
    {
        // Row 1 = headings. Data row 1 starts at sheet row 2.
        return max(2, $this->resumeFromDataRow + 1);
    }

    private function resolveRowValue(array|Collection|null $row, string $field, array $columns): string
    {
        if ($row === null) {
            return '';
        }

        $values = [];
        $keys = !empty($columns) ? $columns : [$field];
        foreach ($keys as $key) {
            $values[] = $this->getRowValue($row, $key);
        }

        return implode(' | ', array_filter($values, fn($value) => $value !== ''));
    }

    private function getRowValue(array|Collection $row, string $key): string
    {
        $value = is_array($row) ? ($row[$key] ?? null) : $row->get($key);
        if ($value === null) {
            return '';
        }

        return trim((string) $value);
    }

    /**
     * @return array<int, array{column: string, count: int}>
     */
    private function formatColumnErrors(): array
    {
        $items = [];
        foreach ($this->columnErrorCounts as $column => $count) {
            $items[] = [
                'column' => $column,
                'count' => $count,
            ];
        }

        usort($items, function (array $a, array $b) {
            if ($a['count'] === $b['count']) {
                return strcmp($a['column'], $b['column']);
            }

            return $b['count'] <=> $a['count'];
        });

        return $items;
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

    private function trackProductCode(string $code, ?string $productId = null): void
    {
        if (!array_key_exists($code, $this->productIdByCodeCache)) {
            $this->productIdByCodeCache[$code] = $productId;
        }

        if (!isset($this->variantsCreatedByCode[$code])) {
            $this->variantsCreatedByCode[$code] = false;
        }

        if (!isset($this->variantsIntendedByCode[$code])) {
            $this->variantsIntendedByCode[$code] = false;
        }
    }

    private function processPendingHeaderRows(): void
    {
        if (empty($this->pendingHeaderRows)) {
            return;
        }

        foreach ($this->pendingHeaderRows as $code => $pending) {
            $hasVariants = $this->variantsCreatedByCode[$code] ?? false;
            $hasVariantIntent = $this->variantsIntendedByCode[$code] ?? false;
            if ($hasVariants || $hasVariantIntent) {
                continue;
            }

            $this->summary['products_parent_without_variants']++;

            $this->registerRowError(
                $pending['row'],
                'Producto sin precio ni variantes. Agrega precio para crear un producto unico.',
                $pending['context'],
                [ProductImportRowMapper::HEADER_PRICE, ProductImportRowMapper::HEADER_SKU_DARYZA],
                $pending['raw_row']
            );
        }

        $this->pendingHeaderRows = [];
    }

    private function processPendingSingleVariantRows(): void
    {
        if (empty($this->pendingSingleVariantRows)) {
            return;
        }

        foreach ($this->pendingSingleVariantRows as $code => $pending) {
            $hasVariants = $this->variantsCreatedByCode[$code] ?? false;
            if ($hasVariants) {
                continue;
            }

            if ($this->dryRun) {
                continue;
            }

            $service = app(ProductImportService::class);
            $product = $pending['product_id']
                ? $service->resolveProductById($pending['product_id'])
                : null;

            if (!$product) {
                $this->registerRowError(
                    $pending['row'],
                    'No se pudo crear el producto unico por falta de referencia.',
                    ['codigo' => $pending['product_code']],
                    [ProductImportRowMapper::HEADER_CODE],
                    $pending['raw_row']
                );
                continue;
            }

            $pendingSku = trim((string) ($pending['variant']['sku_daryza'] ?? ''));
            if ($pendingSku !== '') {
                $skuConflict = $service->findGlobalSkuConflict($pendingSku, $product->id);
                if ($skuConflict) {
                    $this->summary['sku_duplicates']++;
                    $this->registerRowError(
                        $pending['row'],
                        'SKU duplicado contra otro producto existente. Corrige el SKU en el Excel.',
                        [
                            'codigo' => $pending['product_code'],
                            'sku_daryza' => $pendingSku,
                            'producto_conflicto_id' => $skuConflict->product_id,
                            'variante_conflicto_id' => $skuConflict->id,
                        ],
                        [ProductImportRowMapper::HEADER_SKU_DARYZA],
                        $pending['raw_row']
                    );
                    continue;
                }
            }

            $singleVariantData = $this->runTransactionalWithRowError(
                fn() => DB::transaction(function () use ($service, $product, $pending) {
                    $variantStatus = null;
                    $variant = $service->createOrUpdateSingleVariant($product, $pending['variant'], $variantStatus);

                    $specs = $pending['specifications'] ?? [];
                    if (!empty($specs)) {
                        $service->associateVariantSpecifications($variant, $specs);
                    }

                    Log::info("Producto único importado/actualizado: {$product->code}, Variante {$variant->sku}", [
                        'status' => $variantStatus,
                    ]);

                    return [
                        'status' => $variantStatus,
                    ];
                }),
                $pending['row'],
                'Error creando/actualizando producto unico. Se revirtio la fila.',
                [
                    'codigo' => $pending['product_code'],
                ],
                [ProductImportRowMapper::HEADER_CODE, ProductImportRowMapper::HEADER_SKU_DARYZA],
                $pending['raw_row']
            );

            if ($singleVariantData === null) {
                continue;
            }

            $variantStatus = $singleVariantData['status'];
            $this->bumpSummaryStatus('variants', $variantStatus);
            $this->variantsCreatedByCode[$product->code] = true;
        }

        $this->pendingSingleVariantRows = [];
    }

    private function resolveProductIdByCode(string $code): ?string
    {
        $normalized = trim($code);
        if ($normalized === '') {
            return null;
        }

        if (array_key_exists($normalized, $this->productIdByCodeCache)) {
            return $this->productIdByCodeCache[$normalized];
        }

        $id = Product::withTrashed()
            ->where('code', $normalized)
            ->value('id');

        $resolved = is_string($id) && trim($id) !== '' ? $id : null;
        $this->productIdByCodeCache[$normalized] = $resolved;

        return $resolved;
    }

    private function isCancellationException(\Throwable $e): bool
    {
        return $e->getMessage() === self::CANCELLED_EXCEPTION_MARKER;
    }

    /**
     * @template T
     * @param callable():T $callback
     * @param array<string, mixed> $context
     * @param array<int, string> $columns
     * @param array|Collection|null $row
     * @return T|null
     */
    private function runTransactionalWithRowError(
        callable $callback,
        int $excelRow,
        string $rowErrorMessage,
        array $context,
        array $columns,
        array|Collection|null $row = null
    ): mixed {
        try {
            return $callback();
        } catch (\Throwable $e) {
            if ($this->isCancellationException($e)) {
                throw $e;
            }

            $this->registerRowError(
                $excelRow,
                $rowErrorMessage,
                [
                    ...$context,
                    'error' => $e->getMessage(),
                ],
                $columns,
                $row
            );

            return null;
        }
    }

    /**
     * @param callable():void $callback
     * @param array<string, mixed> $context
     */
    private function runTransactionalWithWarning(
        callable $callback,
        string $warningMessage,
        array $context = []
    ): void {
        try {
            $callback();
        } catch (\Throwable $e) {
            if ($this->isCancellationException($e)) {
                throw $e;
            }

            Log::warning($warningMessage, [
                ...$context,
                'error' => $e->getMessage(),
            ]);
        }
    }
    /**
     * Devuelve los IDs de productos importados que tienen al menos
     * una variante activa en promoción. Úsalo post-import para
     * disparar notifyPromotion() solo donde corresponde.
     *
     * @return array<int, string>  product IDs
     */
    public function getImportedProductIdsWithPromo(): array
    {
        if (empty($this->productsCache)) {
            return [];
        }

        $productIds = collect($this->productsCache)
            ->map(fn($p) => is_object($p) ? $p->id : null)
            ->filter()
            ->values()
            ->all();

        if (empty($productIds)) {
            return [];
        }

        $today = now()->format('Y-m-d');

        return \App\Models\Products\ProductVariant::whereIn('product_id', $productIds)
            ->where('is_active', true)
            ->where('is_on_promo', true)
            ->whereNotNull('offer_price')
            ->where('offer_price', '>', 0)
            ->whereColumn('offer_price', '<', 'price')
            // Validar que la fecha de inicio ya haya comenzado o sea nula
            ->where(function ($q) use ($today) {
                $q->whereNull('offer_start_date')
                    ->orWhereDate('offer_start_date', '<=', $today);
            })
            // Validar que la fecha de fin NO haya pasado y no sea nula/vacía
            ->where(function ($q) use ($today) {
                $q->whereNotNull('offer_end_date')
                    ->where('offer_end_date', '!=', '')
                    ->whereDate('offer_end_date', '>=', $today);
            })
            ->pluck('product_id')
            ->unique()
            ->values()
            ->all();
    }
}
