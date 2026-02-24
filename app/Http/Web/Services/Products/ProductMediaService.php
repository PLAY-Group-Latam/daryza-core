<?php

namespace App\Http\Web\Services\Products;

use App\Enums\StorageFolder;
use App\Http\Web\Services\GcsService;
use App\Models\Products\{Product, ProductVariant};
use Illuminate\Http\UploadedFile;

class ProductMediaService
{
    public function __construct(
        protected GcsService $gcsService,
    ) {}

    // =========================================================================
    // Media de variantes
    // =========================================================================

    /**
     * Crea media al crear una variante nueva (flujo store).
     */
    public function createMany(ProductVariant $variant, array $mediaFiles): void
    {
        foreach ($mediaFiles as $order => $file) {
            if (!$file instanceof UploadedFile) continue;

            [$type, $folder] = $this->resolveTypeAndFolder($file, $variant->product_id);

            $variant->media()->create([
                'file_path' => $this->gcsService->uploadFile($file, $folder),
                'type'      => $type,
                'folder'    => $folder,
                'order'     => $order,
            ]);
        }
    }

    /**
     * Sincroniza media al actualizar una variante (flujo update):
     * - Elimina las removidas del frontend
     * - Actualiza el order de las existentes (drag & drop)
     * - Sube las nuevas
     */
    public function sync(ProductVariant $variant, array $media): void
    {
        $existingItems = collect($media)
            ->filter(fn($item) => is_array($item) && isset($item['file_path']))
            ->map(fn($item, $index) => [
                'file_path' => $item['file_path'],
                'order'     => isset($item['position']) ? (int) $item['position'] : $index,
            ])
            ->values()
            ->toArray();

        $existingPaths = collect($existingItems)->pluck('file_path')->toArray();

        $newFiles = collect($media)
            ->filter(fn($item) => $item instanceof UploadedFile);

        // Eliminar los que ya no están en el frontend
        $variant->media()->get()->each(function ($mediaItem) use ($existingPaths) {
            if (!in_array($mediaItem->file_path, $existingPaths)) {
                $this->gcsService->delete($mediaItem->file_path);
                $mediaItem->delete();
            }
        });

        // Actualizar order de los existentes (refleja el drag & drop)
        foreach ($existingItems as $item) {
            $variant->media()
                ->where('file_path', $item['file_path'])
                ->update(['order' => $item['order']]);
        }

        // Subir nuevos archivos a continuación de los existentes
        $nextOrder = count($existingItems);

        foreach ($newFiles as $file) {
            [$type, $folder] = $this->resolveTypeAndFolder($file, $variant->product_id);

            $variant->media()->create([
                'file_path' => $this->gcsService->uploadFile($file, $folder),
                'type'      => $type,
                'folder'    => $folder,
                'order'     => $nextOrder++,
            ]);
        }
    }

    // =========================================================================
    // Fichas técnicas del producto
    // =========================================================================

    /**
     * Crea fichas técnicas al crear un producto nuevo (flujo store).
     */
    public function createTechnicalSheets(Product $product, array $sheets): void
    {
        foreach ($sheets as $sheet) {
            if (!$sheet instanceof UploadedFile) continue;

            $folder = $this->technicalSheetsPath($product->id);

            $product->technicalSheets()->create([
                'file_path' => $this->gcsService->uploadFile($sheet, $folder),
                'type'      => 'technical_sheet',
                'folder'    => $folder,
            ]);
        }
    }

    /**
     * Sincroniza fichas técnicas al actualizar un producto (flujo update):
     * - Elimina las removidas del frontend
     * - Sube las nuevas
     */
    public function syncTechnicalSheets(Product $product, array $sheets): void
    {
        // Si llega vacío, eliminar todo
        if (empty($sheets)) {
            $product->technicalSheets()->get()->each(function ($sheet) {
                $this->gcsService->delete($sheet->file_path);
                $sheet->delete();
            });
            return;
        }

        $existingPaths = collect($sheets)
            ->filter(fn($item) => is_array($item) && isset($item['file_path']))
            ->pluck('file_path')
            ->toArray();

        $product->technicalSheets()->get()->each(function ($sheet) use ($existingPaths) {
            if (!in_array($sheet->file_path, $existingPaths)) {
                $this->gcsService->delete($sheet->file_path);
                $sheet->delete();
            }
        });

        collect($sheets)
            ->filter(fn($item) => $item instanceof UploadedFile)
            ->each(function (UploadedFile $file) use ($product) {
                $folder = $this->technicalSheetsPath($product->id);
                $product->technicalSheets()->create([
                    'file_path' => $this->gcsService->uploadFile($file, $folder),
                    'type'      => 'technical_sheet',
                    'folder'    => $folder,
                ]);
            });
    }

    // =========================================================================
    // Helpers privados
    // =========================================================================

    /**
     * Determina el tipo (image/video/other) y la carpeta de destino en GCS
     * según el mimetype del archivo.
     */
    private function resolveTypeAndFolder(UploadedFile $file, string $productId): array
    {
        $mime  = $file->getMimeType();
        $isImg = str_starts_with($mime, 'image/');
        $isVid = str_starts_with($mime, 'video/');

        $type       = $isImg ? 'image' : ($isVid ? 'video' : 'other');
        $folderEnum = $isImg ? StorageFolder::PRODUCT_IMAGES : StorageFolder::PRODUCT_VIDEOS;

        return [$type, "products/{$productId}/{$folderEnum->value}"];
    }

    private function technicalSheetsPath(string $productId): string
    {
        return "products/{$productId}/" . StorageFolder::TECHNICAL_SHEETS->value;
    }
}
