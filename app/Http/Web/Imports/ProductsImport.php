<?php

namespace App\Http\Web\Imports;

use App\Http\Web\Services\Products\ProductImportService;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

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
                    ]);
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
}
