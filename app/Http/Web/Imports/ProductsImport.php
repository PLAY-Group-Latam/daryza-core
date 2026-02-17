<?php

namespace App\Http\Web\Imports;

use App\Http\Web\Services\Products\ProductImportService;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Carbon\Carbon;

class ProductsImport implements ToCollection, WithChunkReading, WithHeadingRow
{
    public function collection(Collection $rows)
    {
        $service = app(ProductImportService::class);

        // Cache para productos ya creados
        $productsCache = [];
        $lastCode = null;

        foreach ($rows as $rowIndex => $row) {
            $code  = trim($row['codigo'] ?? '');
            $name  = trim($row['nombre'] ?? '');
            $brief = trim($row['descripcion_corta'] ?? '');
            $desc  = trim($row['descripcion'] ?? '');

            // Normalizar precio decimal
            $price = isset($row['precio']) && trim($row['precio']) !== ''
                ? (float) str_replace(',', '.', trim($row['precio']))
                : null;

            $presentation = trim($row['presentacion'] ?? '');
            $aroma        = trim($row['aroma'] ?? '');
            $color        = trim($row['color'] ?? '');
            $size         = trim($row['talla'] ?? '');
            $sku_supplier = trim($row['sku_proveedor'] ?? '') ?: null;
            $sku_daryza   = trim($row['sku_daryza'] ?? '');

            $marca          = trim($row['marca'] ?? '');
            $stock          = (int) ($row['inventario'] ?? 0);
            $dispo          = strtoupper(trim($row['disponibilidad_catalogo'] ?? '')); // 'D' o 'ND'
            $isActive = ($dispo === 'D');

            $peso           = trim($row['peso_kg'] ?? '');
            $alto           = trim($row['alto_cm'] ?? '');
            $largo          = trim($row['largo_cm'] ?? '');
            $ancho          = trim($row['ancho_cm'] ?? '');
            $volumen        = trim($row['volumen_cm'] ?? '');

            $promoPrice = isset($row['precio_oferta']) && trim($row['precio_oferta']) !== ''
                ? (float) str_replace(',', '.', trim($row['precio_oferta']))
                : null;

            // Transformar fechas de Excel a Carbon
            $promoStart = !empty($row['inicio_precio_oferta']) ? $this->transformDate($row['inicio_precio_oferta']) : null;
            $promoEnd   = !empty($row['fin_precio_oferta']) ? $this->transformDate($row['fin_precio_oferta']) : null;

            // Es promo si tiene precio de oferta y es mayor a cero
            $isOnPromo = ($promoPrice !== null && $promoPrice > 0);
            $lineas_negocio = trim($row['linea_de_negocio'] ?? '');
            $categoria      = trim($row['categorias'] ?? '');
            $subcategorias   = trim($row['sub_categorias'] ?? '');
            // Si hay código/nombre, actualizar último código válido
            if ($code && $name) {
                $lastCode = $code;

                // Crear producto solo si no existe en cache
                if (!isset($productsCache[$code])) {
                    $product = $service->createProduct([
                        'code' => $code,
                        'name' => $name,
                        'brief_description' => $brief,
                        'description' => $desc,
                        'is_active'         => $isActive,
                        'is_home'           => false,
                    ]);

                    $service->associateProductCategories($product, $categoria, $subcategorias);
                    $service->associateProductBusinessLines($product, $lineas_negocio);
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
                $variant = $service->createVariant($product, [
                    'sku_supplier' => $sku_supplier,
                    'sku_daryza'   => $sku_daryza,
                    'price'        => $price,
                    'promo_price'    => $promoPrice,
                    'is_on_promo'    => $isOnPromo,
                    'promo_start_at' => $promoStart,
                    'promo_end_at'   => $promoEnd,
                    'stock'        => $stock,
                    'is_active'    => $isActive,
                ]);

                // Asociar atributos solo si tienen valor
                $attributes = array_filter([
                    'Presentación' => $presentation,
                    'Aroma'        => $aroma,
                    'Color'        => $color,
                    'Talla'        => $size,
                ], fn($val) => $val !== null && $val !== '');

                if (!empty($attributes)) {
                    $service->associateVariantAttributes($variant, $attributes);
                }

                $specs = array_filter([
                    'Marca'   => $marca,
                    'Peso'    => $peso ? "$peso kg" : null,
                    'Alto'    => $alto ? "$alto cm" : null,
                    'Largo'   => $largo ? "$largo cm" : null,
                    'Ancho'   => $ancho ? "$ancho cm" : null,
                    'Volumen' => $volumen ? "$volumen cm" : null,
                ], fn($val) => $val !== null && $val !== '');

                if (!empty($specs)) {
                    $service->associateVariantSpecifications($variant, $specs);
                }

                Log::info("Variante creada: SKU {$sku_daryza}, Producto {$product->code}");
            } else {
                Log::warning("Fila {$rowIndex}: variante no creada, SKU o precio inválido.");
            }
        }
    }

    public function chunkSize(): int
    {
        return 300;
    }

    public function headingRow(): int
    {
        return 1;
    }

    private function transformDate($value)
    {
        try {
            if (is_numeric($value)) {
                return \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($value);
            }
            return Carbon::parse($value);
        } catch (\Exception $e) {
            return null;
        }
    }
}
