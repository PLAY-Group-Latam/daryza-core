<?php

namespace App\Http\Web\Services\Products;

use App\Enums\OgType;
use App\Models\Products\{Product, ProductVariant};
use Illuminate\Support\Facades\DB;

class ProductService
{
  public function __construct(
    protected ProductMediaService $mediaService,
  ) {}

  // =========================================================================
  // CRUD
  // =========================================================================

  public function create(array $data): Product
  {
    return DB::transaction(function () use ($data) {

      $hasVariants = !empty($data['variants']);

      $product = Product::create([
        'name'              => $data['name'],
        'slug'              => $data['slug'],
        'brief_description' => $data['brief_description'],
        'description'       => $data['description'],
        'is_active'         => ($data['is_active'] ?? true) && $hasVariants,
        'is_home'           => $data['is_home'] ?? false,
      ]);

      $product->categories()->sync($data['categories'] ?? []);
      $product->businessLines()->sync($data['business_lines'] ?? []);

      $this->createMetadata($product, $data['metadata'] ?? []);
      $this->mediaService->createTechnicalSheets($product, $data['technicalSheets'] ?? []);

      if ($hasVariants) {
        $this->createVariants($product, $data['variants']);
      }

      return $product;
    });
  }

  public function update(Product $product, array $data): Product
  {
    return DB::transaction(function () use ($product, $data) {

      $product->update(collect($data)->only([
        'name',
        'slug',
        'brief_description',
        'description',
        'is_active',
        'is_home',
      ])->toArray());

      if (isset($data['categories'])) {
        $product->categories()->sync($data['categories']);
      }

      if (isset($data['business_lines'])) {
        $product->businessLines()->sync($data['business_lines']);
      }

      if (isset($data['metadata'])) {
        $this->syncMetadata($product, $data['metadata']);
      }

      $this->mediaService->syncTechnicalSheets($product, $data['technicalSheets'] ?? []);

      if (isset($data['variants'])) {
        $this->updateVariants($product, $data['variants']);
      }

      return $product;
    });
  }

  public function delete(Product $product): void
  {
    DB::transaction(function () use ($product) {
      $product->categories()->detach();
      $product->businessLines()->detach();
      $product->delete();
    });
  }

  // =========================================================================
  // Metadata SEO
  // =========================================================================

  protected function createMetadata(Product $product, array $metadata): void
  {
    $product->metadata()->create([
      'meta_title'       => $metadata['meta_title'] ?? $product->name,
      'meta_description' => $metadata['meta_description'] ?? $product->brief_description,
      'canonical_url'    => $metadata['canonical_url'] ?? config('app.frontend_url') . "/productos/{$product->slug}",
      'og_title'         => $metadata['og_title'] ?? $product->name,
      'og_description'   => $metadata['og_description'] ?? $product->brief_description,
      'og_type'          => OgType::PRODUCT,
      'noindex'          => $metadata['noindex'] ?? false,
      'nofollow'         => $metadata['nofollow'] ?? false,
    ]);
  }

  protected function syncMetadata(Product $product, array $metadata): void
  {
    $product->metadata()->updateOrCreate(
      ['metadatable_id' => $product->id, 'metadatable_type' => Product::class],
      $metadata
    );
  }

  // =========================================================================
  // Variantes
  // =========================================================================

  protected function createVariants(Product $product, array $variants): void
  {
    $hasMain = collect($variants)->contains('is_main', true);

    foreach ($variants as $index => $vData) {
      $cleanData = collect($vData)->except([
        'attributes',
        'media',
        'specifications',
        'specification_selector',
      ])->toArray();

      if (!$hasMain && $index === 0) {
        $cleanData['is_main'] = true;
      }

      $variant = $product->variants()->create($cleanData);

      $this->syncAttributes($variant, $vData['attributes'] ?? []);
      $this->syncSpecifications($variant, $vData['specifications'] ?? []);

      if (!empty($vData['media'])) {
        $this->mediaService->createMany($variant, $vData['media']);
      }
    }
  }

  protected function updateVariants(Product $product, array $variantsData): void
  {
    // Los archivos llegan separados en allFiles() — los mergeamos manualmente
    $variantFiles = request()->file('variants') ?? [];

    foreach ($variantsData as $index => $variantData) {

      // Reinsertar UploadedFiles en el índice correcto de media
      if (isset($variantFiles[$index]['media'])) {
        foreach ($variantFiles[$index]['media'] as $mi => $file) {
          $variantData['media'][$mi] = $file;
        }
      }

      $cleanData = collect($variantData)->except([
        'attributes',
        'media',
        'specifications',
        'new_media',
      ])->toArray();

      $variant = $product->variants()->updateOrCreate(
        ['sku' => $variantData['sku']],
        $cleanData
      );

      $this->syncAttributes($variant, $variantData['attributes'] ?? []);
      $this->syncSpecifications($variant, $variantData['specifications'] ?? []);

      if (isset($variantData['media'])) {
        $this->mediaService->sync($variant, $variantData['media']);
      }
    }
  }

  protected function syncAttributes(ProductVariant $variant, array $attributes): void
  {
    $variant->selections()->delete();

    $payload = collect($attributes)
      ->filter(fn($attr) => !empty($attr['attribute_value_id']))
      ->map(fn($attr) => ['attribute_value_id' => $attr['attribute_value_id']])
      ->toArray();

    if (!empty($payload)) {
      $variant->selections()->createMany($payload);
    }
  }

  protected function syncSpecifications(ProductVariant $variant, array $specs): void
  {
    $variant->specifications()->delete();

    if (empty($specs)) return;

    $variant->specifications()->createMany(
      collect($specs)->map(fn($spec) => [
        'attribute_id'       => $spec['attribute_id'],
        'attribute_value_id' => $spec['attribute_value_id'] ?? null,
        'value'              => $spec['value'] ?? null,
      ])->toArray()
    );
  }
}
