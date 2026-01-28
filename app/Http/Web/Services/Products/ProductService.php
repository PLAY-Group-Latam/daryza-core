<?php

namespace App\Http\Web\Services\Products;

use Illuminate\Support\Facades\DB;
use App\Enums\OgType;
use App\Models\Products\Product;
use App\Models\Products\ProductVariant;

class ProductService
{
  public function create(array $data): Product
  {
    return DB::transaction(function () use ($data) {

      // 1. Crear producto
      $product = Product::create([
        'name' => $data['name'],
        'slug' => $data['slug'],
        'category_id' => $data['category_id'],
        'brief_description' => $data['brief_description'],
        'description' => $data['description'],
        'is_active' => $data['is_active'],
      ]);

      // 2. Crear metadata
      $this->createMetadata($product, $data['metadata'] ?? []);

      // 3. Crear variantes
      $this->createVariants($product, $data['variants']);

      // 4. Crear especificaciones
      $this->createSpecifications($product, $data['specifications'] ?? []);

      return $product;
    });
  }

  protected function createMetadata(Product $product, array $metadata): void
  {
    $product->metadata()->create([
      'meta_title' => $metadata['meta_title'] ?? $product->name,
      'meta_description' => $metadata['meta_description'] ?? $product->brief_description,
      'canonical_url' => $metadata['canonical_url']
        ?? config('app.frontend_url') . '/productos/' . $product->slug,
      'og_title' => $metadata['og_title'] ?? $product->name,
      'og_description' => $metadata['og_description'] ?? $product->brief_description,
      'og_type' => OgType::PRODUCT,
      'noindex' => $metadata['noindex'] ?? false,
      'nofollow' => $metadata['nofollow'] ?? false,
    ]);
  }
protected function createVariants(Product $product, array $variants): void
{
    foreach ($variants as &$variantData) {
        unset($variantData['attributes']); // separo los atributos
        $variantData['is_active'] = $variantData['is_active'] ?? true;
        $variantData['is_on_promo'] = $variantData['is_on_promo'] ?? false;
    }

    // Crear todas las variantes de una vez
    $createdVariants = $product->variants()->createMany($variants);

    // Luego asociar atributos
    foreach ($createdVariants as $index => $variant) {
        $this->attachVariantAttributes($variant, $variants[$index]['attributes'] ?? []);
    }
}


 protected function attachVariantAttributes(ProductVariant $variant, array $attributes): void
{
    foreach ($attributes as $attr) {
        $variant->variantAttributes()->create([
            'attribute_value_id' => $attr['attribute_value_id'] ?? null,
        ]);
    }
}


 protected function createSpecifications(Product $product, array $specs): void
{
    foreach ($specs as $spec) {
        $product->specifications()->create([
            'attribute_id' => $spec['attribute_id'],
            'attribute_value_id' => $spec['attribute_value_id'] ?? null,
            'value' => $spec['value'] ?? null,
        ]);
    }
}

}
