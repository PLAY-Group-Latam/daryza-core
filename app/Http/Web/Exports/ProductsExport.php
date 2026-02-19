<?php

namespace App\Http\Web\Exports;

use App\Models\Products\ProductVariant;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class ProductsExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
{
  // Variable para rastrear el último producto procesado
  private $lastProductId = null;

  public function collection()
  {
    // Es vital usar orderBy para que las variantes del mismo producto salgan juntas
    return ProductVariant::with([
      'product.categories',
      'product.businessLines',
      'attributes.attribute',
      'specifications.attribute'
    ])
      ->join('products', 'product_variants.product_id', '=', 'products.id')
      ->orderBy('products.id') // Agrupamos por código de producto
      ->select('product_variants.*') // Evitamos colisión de IDs
      ->get();
  }

  public function headings(): array
  {
    return [
      'Codigo',
      'Nombre',
      'Descripcion Corta',
      'Descripcion',
      'Precio',
      'Precio Oferta',
      'Inicio Precio Oferta',
      'Fin Precio Oferta',
      'Presentacion',
      'Aroma',
      'Color',
      'Talla',
      'SKU Proveedor',
      'SKU Daryza',
      'Marca',
      'Inventario',
      'Disponibilidad Catalogo',
      'Peso KG',
      'Alto CM',
      'Largo CM',
      'Ancho CM',
      'Categorias',
      'Sub Categorias',
      'Linea de Negocio',
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

      $code = $product->id;
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
    }

    $attributes = $variant->attributes->pluck('value', 'attribute.name');
    $specs = $variant->specifications->pluck('value', 'attribute.name');

    return [
      $code,
      $name,
      $brief,
      $desc,
      $variant->price,
      $variant->promo_price,
      $variant->promo_start_at ? $variant->promo_start_at->format('Y-m-d H:i:s') : '',
      $variant->promo_end_at ? $variant->promo_end_at->format('Y-m-d H:i:s') : '',
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
      $catName,
      $subCategories,
      $businessLines,
    ];
  }
}
