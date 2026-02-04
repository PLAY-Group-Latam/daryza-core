<?php

namespace App\Http\Web\Services\Products;

use App\Enums\AttributeType;
use App\Models\Products\{
  Attribute,
  AttributesValue,
  Product,
  ProductVariant
};
use Illuminate\Support\Str;

class ProductImportService
{
  /**
   * Crear producto base (una sola vez por código)
   */
  public function createProduct(array $data): Product
  {
    return Product::firstOrCreate(
      ['code' => $data['code']],
      [
        'id' => Str::ulid(),
        'name' => $data['name'],
        'slug' => Str::slug($data['name']),
        'brief_description' => $data['brief_description'] ?? null,
        'description' => $data['description'] ?? null,
        'brand' => $data['brand'] ?? null,
        'is_active' => true,
      ]
    );
  }


  /**
   * Crear variante de producto
   */
  public function createVariant(Product $product, array $data): ProductVariant
  {
    return ProductVariant::firstOrCreate(
      [
        'product_id' => $product->id,
        'sku' => $data['sku_daryza'],
      ],
      [
        'id' => Str::ulid(),
        'sku_supplier' => $data['sku_supplier'] ?? null,
        'price' => $data['price'],
        'is_main' => false,
      ]
    );
  }


  /**
   * Asociar atributos y valores a una variante
   */
  /**
   * Asociar atributos y valores a una variante
   */
  public function associateVariantAttributes(ProductVariant $variant, array $attributes): void
  {
    foreach ($attributes as $name => $value) {
      if (!$value) continue;

      $attribute = $this->findOrCreateAttribute($name);
      $attributeValue = $this->findOrCreateAttributeValue($attribute, $value);

      // Usar syncWithoutDetaching para no duplicar
      $variant->attributeValues()->syncWithoutDetaching([
        $attributeValue->id => [
          'id' => Str::ulid(),
          'created_at' => now(),
          'updated_at' => now(),
        ]
      ]);
    }
  }


  /**
   * Buscar o crear atributo
   */
  protected function findOrCreateAttribute(string $name): Attribute
  {
    $name = trim($name) ?: 'Sin nombre';

    return Attribute::firstOrCreate(
      ['name' => $name],
      [
        'id' => Str::ulid(),
        'type' => AttributeType::SELECT,
        'is_filterable' => true,
        'is_variant' => true,
      ]
    );
  }

  /**
   * Buscar o crear valor de atributo
   */
  protected function findOrCreateAttributeValue(Attribute $attribute, string $value): AttributesValue
  {
    if (strtolower($attribute->name) === 'color') {
      $value = $this->colorNameToHex(trim(strtolower($value)));
    }

    return AttributesValue::firstOrCreate(
      [
        'attribute_id' => $attribute->id,
        'value' => $value,
      ],
      [
        'id' => Str::ulid(),
      ]
    );
  }

  protected function colorNameToHex(string $color_name): string
  {
    $colors = [
      'azul alice' => 'F0F8FF',
      'blanco antiguo' => 'FAEBD7',
      'agua' => '00FFFF',
      'aguamarina' => '7FFFD4',
      'azul celeste' => 'F0FFFF',
      'beige' => 'F5F5DC',
      'bisque' => 'FFE4C4',
      'negro' => '000000',
      'almendra blanqueada' => 'FFEBCD',
      'azul' => '0000FF',
      'violeta azul' => '8A2BE2',
      'marrón' => 'A52A2A',
      'madera de arce' => 'DEB887',
      'azul cadete' => '5F9EA0',
      'chartreuse' => '7FFF00',
      'chocolate' => 'D2691E',
      'coral' => 'FF7F50',
      'azul aciano' => '6495ED',
      'maíz' => 'FFF8DC',
      'carmesí' => 'DC143C',
      'cian' => '00FFFF',
      'azul oscuro' => '00008B',
      'cian oscuro' => '008B8B',
      'oro oscuro' => 'B8860B',
      'gris oscuro' => 'A9A9A9',
      'verde oscuro' => '006400',
      'gris oscuro' => 'A9A9A9',
      'caqui oscuro' => 'BDB76B',
      'magenta oscuro' => '8B008B',
      'verde oliva oscuro' => '556B2F',
      'naranja oscuro' => 'FF8C00',
      'orquídea oscura' => '9932CC',
      'rojo oscuro' => '8B0000',
      'salmón oscuro' => 'E9967A',
      'verde mar oscuro' => '8FBC8F',
      'azul pizarra oscuro' => '483D8B',
      'gris pizarra oscuro' => '2F4F4F',
      'turquesa oscuro' => '00CED1',
      'violeta oscuro' => '9400D3',
      'rosa intenso' => 'FF1493',
      'azul cielo intenso' => '00BFFF',
      'gris medio' => '696969',
      'gris medio' => '696969',
      'azul dodger' => '1E90FF',
      'ladrillo' => 'B22222',
      'blanco floral' => 'FFFAF0',
      'verde bosque' => '228B22',
      'fucsia' => 'FF00FF',
      'gris gainsboro' => 'DCDCDC',
      'blanco fantasma' => 'F8F8FF',
      'oro' => 'FFD700',
      'oro viejo' => 'DAA520',
      'gris' => '808080',
      'verde' => '008000',
      'verde amarillento' => 'ADFF2F',
      'gris' => '808080',
      'miel' => 'F0FFF0',
      'rosa intenso' => 'FF69B4',
      'rojo indio' => 'CD5C5C',
      'índigo' => '4B0082',
      'marfil' => 'FFFFF0',
      'caqui' => 'F0E68C',
      'lavanda' => 'E6E6FA',
      'rubor lavanda' => 'FFF0F5',
      'verde césped' => '7CFC00',
      'chiffon limón' => 'FFFACD',
      'azul claro' => 'ADD8E6',
      'coral claro' => 'F08080',
      'cian claro' => 'E0FFFF',
      'amarillo dorado claro' => 'FAFAD2',
      'gris claro' => 'D3D3D3',
      'verde claro' => '90EE90',
      'gris claro' => 'D3D3D3',
      'rosa claro' => 'FFB6C1',
      'salmón claro' => 'FFA07A',
      'verde mar claro' => '20B2AA',
      'azul cielo claro' => '87CEFA',
      'gris pizarra claro' => '778899',
      'gris pizarra claro' => '778899',
      'azul acero claro' => 'B0C4DE',
      'amarillo claro' => 'FFFFE0',
      'lima' => '00FF00',
      'verde lima' => '32CD32',
      'lino' => 'FAF0E6',
      'magenta' => 'FF00FF',
      'granate' => '800000',
      'aguamarina media' => '66CDAA',
      'azul medio' => '0000CD',
      'orquídea media' => 'BA55D3',
      'púrpura media' => '9370D0',
      'verde mar medio' => '3CB371',
      'azul pizarra medio' => '7B68EE',
      'verde primavera medio' => '00FA9A',
      'turquesa medio' => '48D1CC',
      'rojo violeta medio' => 'C71585',
      'azul medianoche' => '191970',
      'crema menta' => 'F5FFFA',
      'rosa neblina' => 'FFE4E1',
      'mocasín' => 'FFE4B5',
      'blanco navajo' => 'FFDEAD',
      'azul marino' => '000080',
      'encaje antiguo' => 'FDF5E6',
      'oliva' => '808000',
      'oliva oliva' => '6B8E23',
      'naranja' => 'FFA500',
      'rojo anaranjado' => 'FF4500',
      'orquídea' => 'DA70D6',
      'oro pálido' => 'EEE8AA',
      'verde pálido' => '98FB98',
      'turquesa pálido' => 'AFEEEE',
      'rojo violeta pálido' => 'DB7093',
      'papaya' => 'FFEFD5',
      'melocotón' => 'FFDAB9',
      'perú' => 'CD853F',
      'rosa' => 'FFC0CB',
      'ciruela' => 'DDA0DD',
      'azul polvo' => 'B0E0E6',
      'púrpura' => '800080',
      'rojo' => 'FF0000',
      'marrón rosado' => 'BC8F8F',
      'azul real' => '4169E1',
      'marrón silla' => '8B4513',
      'salmón' => 'FA8072',
      'marrón arena' => 'F4A460',
      'verde mar' => '2E8B57',
      'concha de mar' => 'FFF5EE',
      'siena' => 'A0522D',
      'plata' => 'C0C0C0',
      'azul cielo' => '87CEEB',
      'azul pizarra' => '6A5ACD',
      'gris pizarra' => '708090',
      'gris pizarra' => '708090',
      'nieve' => 'FFFAFA',
      'verde primavera' => '00FF7F',
      'azul acero' => '4682B4',
      'caqui' => 'D2B48C',
      'verde azulado' => '008080',
      'cardo' => 'D8BFD8',
      'tomate' => 'FF6347',
      'turquesa' => '40E0D0',
      'violeta' => 'EE82EE',
      'trigo' => 'F5DEB3',
      'blanco' => 'FFFFFF',
      'gris blanco' => 'F5F5F5',
      'amarillo' => 'FFFF00',
      'verde amarillo' => '9ACD32'
    ];

    $color_name = strtolower($color_name);

    return isset($colors[$color_name]) ? '#' . $colors[$color_name] : '#808080'; // fallback gris
  }
}
