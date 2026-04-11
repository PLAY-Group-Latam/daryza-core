<?php

namespace App\Http\Web\Exports;

use App\Http\Web\Services\Products\ProductImportRowMapper;
use App\Models\Products\ProductVariant;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithColumnWidths;

class ProductsExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithColumnWidths
{
  /**
   * Variable para rastrear el último producto procesado.
   */
  private ?string $lastProductId = null;

  public function collection()
  {
    // Es vital usar orderBy para que las variantes del mismo producto salgan juntas
    return ProductVariant::with([
      'product.categories',
      'product.businessLines',
      'product.recommendedProducts',
      'attributes.attribute',
      'specifications.attribute'
    ])
      ->join('products', 'product_variants.product_id', '=', 'products.id')
      ->orderBy('products.code') // Agrupamos por código de producto
      ->orderBy('product_variants.created_at')
      ->orderBy('product_variants.id')
      ->select('product_variants.*') // Evitamos colisión de IDs
      ->get();
  }

  public function headings(): array
  {
    return [
      ProductImportRowMapper::HEADER_CODE,
      ProductImportRowMapper::HEADER_NAME,
      ProductImportRowMapper::HEADER_BRIEF,
      ProductImportRowMapper::HEADER_DESCRIPTION,
      ProductImportRowMapper::HEADER_PRICE,
      ProductImportRowMapper::HEADER_PRESENTATION,
      ProductImportRowMapper::HEADER_AROMA,
      ProductImportRowMapper::HEADER_COLOR,
      ProductImportRowMapper::HEADER_SIZE,
      ProductImportRowMapper::HEADER_SKU_SUPPLIER,
      ProductImportRowMapper::HEADER_SKU_DARYZA,
      ProductImportRowMapper::HEADER_BRAND,
      ProductImportRowMapper::HEADER_STOCK,
      ProductImportRowMapper::HEADER_AVAILABILITY,
      ProductImportRowMapper::HEADER_WEIGHT,
      ProductImportRowMapper::HEADER_HEIGHT,
      ProductImportRowMapper::HEADER_LENGTH,
      ProductImportRowMapper::HEADER_WIDTH,
      ProductImportRowMapper::HEADER_VOLUME,
      ProductImportRowMapper::HEADER_PROMO_PRICE,
      ProductImportRowMapper::HEADER_PROMO_START,
      ProductImportRowMapper::HEADER_PROMO_END,
      ProductImportRowMapper::HEADER_BUSINESS_LINE,
      ProductImportRowMapper::HEADER_CATEGORY,
      ProductImportRowMapper::HEADER_SUBCATEGORY,
      'productos_recomendados',
    ];
  }

  public function map($variant): array
  {
    $product = $variant->product;

    // ¿Es este un producto nuevo o es otra variante del mismo?
    $isNewProduct = ($this->lastProductId !== $product->id);

    // Actualizamos el ID para la siguiente fila
    $this->lastProductId = $product->id;

    // Extraer datos comunes solo si es un producto nuevo
    if ($isNewProduct) {
      $parentCategory = $product->categories->where('parent_id', null)->first();
      $subCategories = $product->categories->where('parent_id', '!=', null)->pluck('name')->implode(', ');
      $businessLines = $product->businessLines->pluck('name')->implode(', ');
      $recommendedCodes = $product->recommendedProducts
        ->pluck('code')
        ->filter()
        ->implode(', ');

      $code = $product->code;
      $name = $product->name;
      $brief = $product->brief_description;
      $desc = $product->description;
      $catName = $parentCategory ? $parentCategory->name : '';
    } else {
      // Celdas vacías para las variantes subsiguientes
      $code = '';
      $name = '';
      $brief = '';
      $desc = '';
      $catName = '';
      $subCategories = '';
      $businessLines = '';
      $recommendedCodes = '';
    }

    $attributes = $variant->attributes->pluck('value', 'attribute.name');
    $specs = $variant->specifications->pluck('value', 'attribute.name');

    return [
      $code,
      $name,
      $brief,
      $desc,
      $variant->price,
      $attributes->get('Presentación'),
      $attributes->get('Aroma'),
      $attributes->get('Color'),
      $attributes->get('Talla'),
      $variant->sku_supplier,
      $variant->sku, // SKU Daryza
      $specs->get('Marca'),
      $variant->stock,
      $variant->is_active ? 'D' : 'ND',
      str_replace(' kg', '', $specs->get('Peso')),
      str_replace(' cm', '', $specs->get('Alto')),
      str_replace(' cm', '', $specs->get('Largo')),
      str_replace(' cm', '', $specs->get('Ancho')),
      str_replace(' cm', '', $specs->get('Volumen')),
      $variant->promo_price,
      $variant->promo_start_at ? $variant->promo_start_at->format('d/m/Y') : '',
      $variant->promo_end_at ? $variant->promo_end_at->format('d/m/Y') : '',
      $businessLines,
      $catName,
      $subCategories,
      $recommendedCodes,
    ];
  }

  public function columnWidths(): array
  {
    return [
      // nombre
      'B' => 36,
      // descripcion_corta
      'C' => 40,
      // descripcion
      'D' => 48,
    ];
  }
}
