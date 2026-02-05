<?php

namespace App\Http\Web\Services\Products;

use Illuminate\Support\Facades\DB;
use App\Enums\OgType;
use App\Enums\StorageFolder;
use App\Http\Web\Services\GcsService;
use App\Models\Products\Product;
use App\Models\Products\ProductCategory;
use App\Models\Products\ProductVariant;
use Illuminate\Support\Str;

class ProductService
{

  protected GcsService $gcsService;

  public function __construct(GcsService $gcsService)
  {
    $this->gcsService = $gcsService;
  }
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

      $this->createTechnicalSheets($product, $data['technicalSheets'] ?? []);

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

  protected function createTechnicalSheets(Product $product, array $sheets): void
  {
    foreach ($sheets as $sheet) {
      $filePath = $sheet['file_path'] ?? null;

      // Carpeta base para este producto
      $productFolder = 'products/' . $product->id;

      // Subir si hay un archivo nuevo
      if (!empty($sheet['file'])) {
        $folder = $productFolder . '/' . StorageFolder::TECHNICAL_SHEETS->value;
        $filePath = $this->gcsService->uploadFile($sheet['file'], $folder);
      }

      if ($filePath) {
        $product->technicalSheets()->create([
          'file_path' => $filePath,
          'type' => 'technical_sheet',
          'folder' => $productFolder . '/' . StorageFolder::TECHNICAL_SHEETS->value, // opcional
        ]);
      }
    }
  }




  protected function createVariants(Product $product, array $variants): void
  {
    foreach ($variants as &$variantData) {
      unset($variantData['attributes']); // separo los atributos
      $variantData['is_active'] = $variantData['is_active'] ?? true;
      $variantData['is_on_promo'] = $variantData['is_on_promo'] ?? false;
      $variantData['is_main'] = $variantData['is_main'];
    }

    // Crear todas las variantes de una vez
    $createdVariants = $product->variants()->createMany($variants);

    // Luego asociar atributos
    foreach ($createdVariants as $index => $variant) {
      $this->attachVariantAttributes($variant, $variants[$index]['attributes'] ?? []);
      $this->createVariantMedia($variant, $variants[$index]['media'] ?? []);
    }
  }
  protected function createVariantMedia(ProductVariant $variant, array $mediaFiles): void
  {
    foreach ($mediaFiles as $media) {
      // $media es UploadedFile
      $type = strtolower($media->getClientOriginalExtension()) === 'mp4' ? 'video' : 'image';

      $productFolder = 'products/' . $variant->product_id;
      $folder = $type === 'video'
        ? $productFolder . '/' . StorageFolder::PRODUCT_VIDEOS->value
        : $productFolder . '/' . StorageFolder::PRODUCT_IMAGES->value;

      $filePath = $this->gcsService->uploadFile($media, $folder);

      $variant->media()->create([
        'file_path' => $filePath,
        'type' => $type,
        'folder' => $folder,
      ]);
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

  public function update(Product $product, array $data): Product
  {
    return DB::transaction(function () use ($product, $data) {

      // 1. Producto
      $product->update([
        'name' => $data['name'],
        'slug' => $data['slug'],
        'category_id' => $data['category_id'],
        'brief_description' => $data['brief_description'],
        'description' => $data['description'],
        'is_active' => $data['is_active'],
      ]);

      // 2. Metadata
      $this->updateMetadata($product, $data['metadata'] ?? []);

      // 3. Variantes + media + attributes
      $this->syncVariants($product, $data['variants'] ?? []);

      // 4. Fichas técnicas
      $this->syncTechnicalSheets($product, $data['technicalSheets'] ?? []);

      // 5. Especificaciones
      $this->syncSpecifications($product, $data['specifications'] ?? []);

      return $product->fresh();
    });
  }

  protected function updateMetadata(Product $product, array $metadata): void
  {
    $product->metadata()->updateOrCreate(
      [],
      [
        'meta_title' => $metadata['meta_title'] ?? $product->name,
        'meta_description' => $metadata['meta_description'] ?? $product->brief_description,
        'canonical_url' => $metadata['canonical_url']
          ?? config('app.frontend_url') . '/productos/' . $product->slug,
        'og_title' => $metadata['og_title'] ?? $product->name,
        'og_description' => $metadata['og_description'] ?? $product->brief_description,
        'og_type' => OgType::PRODUCT,
        'noindex' => $metadata['noindex'] ?? false,
        'nofollow' => $metadata['nofollow'] ?? false,
      ]
    );
  }

  protected function syncVariants(Product $product, array $variants): void
  {
    $incomingIds = collect($variants)->pluck('id')->filter()->toArray();

    // 1. Eliminar variantes quitadas en frontend
    $product->variants()
      ->whereNotIn('id', $incomingIds)
      ->each(function ($variant) {
        $variant->media->each(
          fn($m) =>
          $this->gcsService->deleteFromPublicUrl($m->file_path)
        );
        $variant->delete();
      });

    foreach ($variants as $variantData) {

      $attributes = $variantData['attributes'] ?? [];
      $media = $variantData['media'] ?? [];

      unset($variantData['attributes'], $variantData['media']);

      $variant = $product->variants()->updateOrCreate(
        ['id' => $variantData['id'] ?? null],
        [
          ...$variantData,
          'is_active' => $variantData['is_active'] ?? true,
          'is_on_promo' => $variantData['is_on_promo'] ?? false,
        ]
      );

      // Attributes (reset limpio)
      $variant->variantAttributes()->delete();
      $this->attachVariantAttributes($variant, $attributes);

      // Media (limpia + sube)
      $this->syncVariantMedia($variant, $media);
    }
  }

  protected function syncVariantMedia(ProductVariant $variant, array $mediaItems): void
  {
    $incomingPaths = collect($mediaItems)
      ->pluck('file_path')
      ->filter()
      ->toArray();

    // 1. Eliminar media quitada
    $variant->media()->get()->each(function ($media) use ($incomingPaths) {

      if (!in_array($media->file_path, $incomingPaths)) {
        $this->gcsService->deleteFromPublicUrl($media->file_path);
        $media->delete();
      }
    });

    // 2. Subir nuevos archivos
    foreach ($mediaItems as $media) {
      if (empty($media['file'])) continue;

      $file = $media['file'];
      $type = $file->getClientOriginalExtension() === 'mp4' ? 'video' : 'image';

      $folder = 'products/' . $variant->product_id . '/' . (
        $type === 'video'
        ? StorageFolder::PRODUCT_VIDEOS->value
        : StorageFolder::PRODUCT_IMAGES->value
      );

      $filePath = $this->gcsService->uploadFile($file, $folder);

      $variant->media()->create([
        'file_path' => $filePath,
        'type' => $type,
        'folder' => $folder,
      ]);
    }
  }


  protected function syncTechnicalSheets(Product $product, array $sheets): void
  {
    $incomingPaths = collect($sheets)
      ->pluck('file_path')
      ->filter()
      ->toArray();

    // eliminar fichas quitadas
    $product->technicalSheets()->get()->each(function ($sheet) use ($incomingPaths) {

      if (!in_array($sheet->file_path, $incomingPaths)) {
        $this->gcsService->deleteFromPublicUrl($sheet->file_path);
        $sheet->delete();
      }
    });

    // subir nuevas
    foreach ($sheets as $sheet) {
      if (empty($sheet['file'])) continue;

      $folder = 'products/' . $product->id . '/' . StorageFolder::TECHNICAL_SHEETS->value;
      $filePath = $this->gcsService->uploadFile($sheet['file'], $folder);

      $product->technicalSheets()->create([
        'file_path' => $filePath,
        'type' => 'technical_sheet',
        'folder' => $folder,
      ]);
    }
  }

  protected function syncSpecifications(Product $product, array $specs): void
  {
    $product->specifications()->delete();

    foreach ($specs as $spec) {
      $product->specifications()->create([
        'attribute_id' => $spec['attribute_id'],
        'attribute_value_id' => $spec['attribute_value_id'] ?? null,
        'value' => $spec['value'],
      ]);
    }
  }
}
