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

  public function create(array $data, array $variantFiles = []): Product
  {
    return DB::transaction(function () use ($data, $variantFiles) {

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
      $this->syncRecommendedProducts($product, $data['recommended_product_ids'] ?? []);

      $this->createMetadata($product, $data['metadata'] ?? []);
      $this->mediaService->createTechnicalSheets($product, $data['technicalSheets'] ?? []);

      if ($hasVariants) {
        $this->createVariants($product, $data['variants'], $variantFiles);
      }

      return $product;
    });
  }

  public function update(Product $product, array $data, array $variantFiles = []): Product
  {
    return DB::transaction(function () use ($product, $data, $variantFiles) {

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

      if (array_key_exists('recommended_product_ids', $data)) {
        $this->syncRecommendedProducts($product, $data['recommended_product_ids'] ?? []);
      }

      if (isset($data['metadata'])) {
        $this->syncMetadata($product, $data['metadata']);
      }

      $this->mediaService->syncTechnicalSheets($product, $data['technicalSheets'] ?? []);

      if (isset($data['variants'])) {
        $this->updateVariants($product, $data['variants'], $variantFiles);

        // Coherencia de catálogo: un producto sin variantes no debe quedar activo.
        if (!$product->variants()->exists() && $product->is_active) {
          $product->update(['is_active' => false]);
        }
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

  protected function createVariants(Product $product, array $variantsData, array $variantFiles = []): void
  {
    $hasMain = collect($variantsData)->contains(fn($v) => (bool) ($v['is_main'] ?? false));
    $createdVariantIds = [];

    foreach ($variantsData as $index => $variantData) {
      $variantData = $this->mergeVariantMediaFiles($variantData, $variantFiles[$index] ?? null);

      $cleanData = collect($variantData)->except([
        'id',
        'attributes',
        'media',
        'specifications',
        'specification_selector',
        'new_media',
      ])->toArray();

      if (!$hasMain && $index === 0) {
        $cleanData['is_main'] = true;
      }

      $variant = $product->variants()->create($cleanData);
      $createdVariantIds[] = $variant->id;

      $this->syncAttributes($variant, $variantData['attributes'] ?? []);
      $this->syncSpecifications($variant, $variantData['specifications'] ?? []);

      if (!empty($variantData['media'])) {
        $this->mediaService->createMany($variant, $variantData['media']);
      }
    }

    $this->normalizeMainVariant($product, $createdVariantIds);
  }

  protected function updateVariants(Product $product, array $variantsData, array $variantFiles = []): void
  {
    $existingVariants = $product->variants()->get()->keyBy('id');
    $keptVariantIds = [];
    $hasMain = collect($variantsData)->contains(fn($v) => (bool) ($v['is_main'] ?? false));

    foreach ($variantsData as $index => $variantData) {
      $variantData = $this->mergeVariantMediaFiles($variantData, $variantFiles[$index] ?? null);
      $cleanData = collect($variantData)->except([
        'id',
        'attributes',
        'media',
        'specifications',
        'new_media',
      ])->toArray();

      if (!$hasMain && $index === 0) {
        $cleanData['is_main'] = true;
      }

      $variant = null;
      $variantId = $variantData['id'] ?? null;

      if ($variantId && $existingVariants->has($variantId)) {
        $variant = $existingVariants->get($variantId);
        $variant->update($cleanData);
      } else {
        $variant = $product->variants()->create($cleanData);
      }

      $keptVariantIds[] = $variant->id;

      $this->syncAttributes($variant, $variantData['attributes'] ?? []);
      $this->syncSpecifications($variant, $variantData['specifications'] ?? []);

      if (isset($variantData['media'])) {
        $this->mediaService->sync($variant, $variantData['media']);
      }
    }

    if (empty($keptVariantIds)) {
      $product->variants()->delete();
      return;
    }

    $product->variants()->whereNotIn('id', $keptVariantIds)->delete();
    $this->normalizeMainVariant($product, $keptVariantIds);
  }

  protected function mergeVariantMediaFiles(array $variantData, ?array $variantFileChunk = null): array
  {
    if (!isset($variantFileChunk['media']) || !is_array($variantFileChunk['media'])) {
      return $variantData;
    }

    foreach ($variantFileChunk['media'] as $mediaIndex => $uploadedFile) {
      $variantData['media'][$mediaIndex] = $uploadedFile;
    }

    return $variantData;
  }

  protected function normalizeMainVariant(Product $product, array $variantIds): void
  {
    if (empty($variantIds)) {
      return;
    }

    $activeMainId = $product->variants()
      ->whereIn('id', $variantIds)
      ->where('is_active', true)
      ->where('is_main', true)
      ->value('id');

    $mainId = $activeMainId
      ?? $product->variants()
      ->whereIn('id', $variantIds)
      ->where('is_active', true)
      ->orderBy('created_at', 'asc')
      ->orderBy('id', 'asc')
      ->value('id');

    if (!$mainId) {
      // Si no hay variantes activas, no dejamos principal marcada.
      $product->variants()
        ->whereIn('id', $variantIds)
        ->update(['is_main' => false]);
      return;
    }

    $product->variants()
      ->whereIn('id', $variantIds)
      ->where('id', '!=', $mainId)
      ->update(['is_main' => false]);

    $product->variants()
      ->where('id', $mainId)
      ->update(['is_main' => true]);
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

  protected function syncRecommendedProducts(Product $product, array $recommendedIds): void
  {
    $syncPayload = collect($recommendedIds)
      ->filter(fn($id) => is_string($id) && $id !== '')
      ->unique()
      ->reject(fn($id) => $id === $product->id)
      ->values()
      ->mapWithKeys(fn($id, $index) => [
        $id => ['position' => $index + 1],
      ])
      ->all();

    $product->recommendedProducts()->sync($syncPayload);
  }
}
