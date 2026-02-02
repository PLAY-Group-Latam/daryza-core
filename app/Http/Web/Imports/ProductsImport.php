<?php

namespace App\Http\Web\Imports;

use App\Http\Web\Services\Products\ProductService;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithChunkReading;

class ProductsImport implements ToCollection, WithHeadingRow, WithChunkReading
{
    protected ProductService $productService;

    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }

    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            $data = $row->toArray();

            $productData = [
                'name' => $data['nombre'] ?? '',
                'slug' => Str::slug($data['nombre'] ?? ''),
                // 'category_id' => $this->productService->getCategoryIdByName($data['categoria'] ?? ''),
                'brief_description' => $data['descripcion'] ?? '',
                'description' => $data['descripcion'] ?? '',
                'is_active' => true,
                'variants' => [
                    [
                        'sku' => $data['sku'] ?? null,
                        'price' => $data['precio'] ?? 0,
                        'stock' => $data['stock'] ?? 0,
                        'is_active' => true,
                        'is_main' => true,
                    ],
                ],
            ];

            $this->productService->create($productData);
        }
    }

    public function chunkSize(): int
    {
        return 500;
    }
}