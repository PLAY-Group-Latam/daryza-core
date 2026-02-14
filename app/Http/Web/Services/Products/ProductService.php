<?php

namespace App\Http\Web\Services\Products;

use App\Enums\{OgType, StorageFolder};
use App\Http\Web\Services\GcsService;
use App\Models\Products\{Product, ProductVariant};
use Illuminate\Support\Facades\{DB, Log};

class ProductService
{
  public function __construct(
    protected GcsService $gcsService
  ) {}

  /**
   * Crea un producto completo con sus relaciones.
   */
  public function create(array $data): Product
  {
    return DB::transaction(function () use ($data) {
      $product = Product::create([
        'name'              => $data['name'],
        'slug'              => $data['slug'],
        'brief_description' => $data['brief_description'],
        'description'       => $data['description'],
        'is_active'         => $data['is_active'] ?? true,
      ]);

      $product->categories()->sync($data['categories'] ?? []);
      $product->businessLines()->sync($data['business_lines'] ?? []);

      // 3. Procesar componentes complejos
      $this->createMetadata($product, $data['metadata'] ?? []);
      $this->createTechnicalSheets($product, $data['technicalSheets'] ?? []);
      $this->createSpecifications($product, $data['specifications'] ?? []);
      $this->createVariants($product, $data['variants'] ?? []);

      return $product;
    });
  }

  public function update(Product $product, array $data): Product
  {
    return DB::transaction(function () use ($product, $data) {
      // Actualización base
      $product->update(collect($data)->only([
        'name',
        'slug',
        'brief_description',
        'description',
        'is_active'
      ])->toArray());

      // 3. Sincronizar categorías en el Update
      if (isset($data['categories'])) {
        $product->categories()->sync($data['categories']);
      }

      if (isset($data['business_lines'])) {
        $product->businessLines()->sync($data['business_lines']);
      }
      // 1. Metadata
      if (isset($data['metadata'])) {
        $product->metadata()->updateOrCreate(
          ['metadatable_id' => $product->id, 'metadatable_type' => Product::class],
          $data['metadata']
        );
      }

      // 2. Fichas Técnicas
      if (!empty($data['technicalSheets'])) {
        $this->createTechnicalSheets($product, $data['technicalSheets']);
      }

      // 3. Especificaciones (Reemplazo total)
      if (isset($data['specifications'])) {
        $product->specifications()->delete();
        $this->createSpecifications($product, $data['specifications']);
      }

      // 4. Variantes
      if (isset($data['variants'])) {
        $this->updateVariants($product, $data['variants']);
      }

      return $product;
    });
  }

  protected function updateVariants(Product $product, array $variantsData): void
  {
    foreach ($variantsData as $variantData) {
      // Limpiamos campos que no pertenecen a la tabla
      $cleanData = collect($variantData)->except(['attributes', 'media', 'new_media'])->toArray();

      $variant = $product->variants()->updateOrCreate(
        ['sku' => $variantData['sku']],
        $cleanData
      );

      // 3. REEMPLAZO DE SYNC (La solución al error)
      if (isset($variantData['attributes'])) {
        // Borramos los registros actuales usando la relación HasMany
        $variant->variantAttributeValues()->delete();

        // Insertamos los nuevos uno por uno para que se generen los ULIDs
        foreach ($variantData['attributes'] as $attr) {
          if (empty($attr['attribute_value_id'])) continue;

          $variant->variantAttributeValues()->create([
            'attribute_value_id' => $attr['attribute_value_id']
          ]);
        }
      }

      // Nuevos archivos
      if (!empty($variantData['new_media'])) {
        $this->createVariantMedia($variant, $variantData['new_media']);
      }
    }
  }

  /**
   * Orquestador de relaciones para mantener el método create limpio.
   */
  // protected function processProductRelations(Product $product, array $data): void
  // {

  //   // 4. Sincronizar categorías al crear
  //   if (!empty($data['categories'])) {
  //     // Laravel usará el ProductCategoryPivot automáticamente
  //     $product->categories()->sync($data['categories']);
  //   }
  //   if (!empty($data['business_lines'])) {
  //     $product->businessLines()->sync($data['business_lines']);
  //   }

  //   $this->createMetadata($product, $data['metadata'] ?? []);
  //   $this->createTechnicalSheets($product, $data['technicalSheets'] ?? []);
  //   $this->createVariants($product, $data['variants'] ?? []);
  //   $this->createSpecifications($product, $data['specifications'] ?? []);
  // }

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

  protected function createTechnicalSheets(Product $product, array $sheets): void
  {
    foreach ($sheets as $sheet) {
      // 1. Usamos null coalescing para ser más seguros
      $file = $sheet['file'] ?? null;
      if (!$file) continue;

      // 2. Simplificamos la obtención de la ruta
      $folder = $this->getStoragePath($product->id, StorageFolder::TECHNICAL_SHEETS);

      // 3. Creamos directamente
      $product->technicalSheets()->create([
        'file_path' => $this->gcsService->uploadFile($file, $folder),
        'type'      => 'technical_sheet', // Si usas Enums aquí, mejor.
        'folder'    => $folder,
      ]);
    }
  }

  protected function createVariants(Product $product, array $variants): void
  {
    $hasMain = collect($variants)->contains('is_main', true);
    foreach ($variants as $index => $vData) {
      $cleanData = collect($vData)->except(['attributes', 'media'])->toArray();

      // Regla de negocio: la primera variante siempre es la principal por defecto
      if (!$hasMain && $index === 0) {
        $cleanData['is_main'] = true;
      }

      $variant = $product->variants()->create($cleanData);

      if (!empty($vData['attributes'])) {
        $this->attachVariantAttributes($variant, $vData['attributes']);
      }

      // 3. Media
      if (!empty($vData['media'])) {
        $this->createVariantMedia($variant, $vData['media']);
      }
    }
  }

  protected function createVariantMedia(ProductVariant $variant, array $mediaFiles): void
  {
    foreach ($mediaFiles as  $file) {
      $mime = $file->getMimeType();
      $isImg = str_starts_with($mime, 'image/');
      $isVid = str_starts_with($mime, 'video/');

      // Determinamos el tipo y carpeta dinámicamente
      $type = $isImg ? 'image' : ($isVid ? 'video' : 'other');
      $folderEnum = $isImg ? StorageFolder::PRODUCT_IMAGES : StorageFolder::PRODUCT_VIDEOS;

      $folder = $this->getStoragePath($variant->product_id, $folderEnum);

      $variant->media()->create([
        'file_path' => $this->gcsService->uploadFile($file, $folder),
        'type'      => $type,
        'folder'    => $folder,
      ]);
    }
  }

  protected function attachVariantAttributes(ProductVariant $variant, array $attributes): void
  {
    $payload = collect($attributes)
      ->filter(fn($attr) => !empty($attr['attribute_value_id']))
      ->map(fn($attr) => ['attribute_value_id' => $attr['attribute_value_id']])
      ->toArray();

    if (!empty($payload)) {
      $variant->selections()->createMany($payload);
    }
  }

  protected function createSpecifications(Product $product, array $specs): void
  {
    if (empty($specs)) return;

    $product->specifications()->createMany(
      collect($specs)->map(fn($spec) => [
        'attribute_id'       => $spec['attribute_id'],
        'attribute_value_id' => $spec['attribute_value_id'] ?? null,
        'value'              => $spec['value'] ?? null,
      ])->toArray()
    );
  }

  /**
   * Genera la ruta estandarizada para el almacenamiento en GCS.
   */
  protected function getStoragePath(string $productId, StorageFolder $folder): string
  {
    return "products/{$productId}/{$folder->value}";
  }
}
