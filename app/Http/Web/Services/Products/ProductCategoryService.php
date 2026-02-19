<?php

namespace App\Http\Web\Services\Products;

use App\Http\Web\Services\GcsService;
use App\Models\Products\ProductCategory;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class ProductCategoryService
{
    protected GcsService $gcsService;

    // Inyectamos el servicio de Google Cloud Storage
    public function __construct(GcsService $gcsService)
    {
        $this->gcsService = $gcsService;
    }

    /**
     * Obtener el árbol de categorías paginado para la tabla.
     */
    public function getPaginatedTree(int $perPage = 10): LengthAwarePaginator
    {
        return ProductCategory::roots()
            ->with('children')
            ->orderBy('order')
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * Obtener solo las categorías activas estructuradas para Selects.
     */
    public function getActiveTreeForSelect(): Collection
    {
        return ProductCategory::roots()
            ->active()
            ->with(['children' => function ($query) {
                $query->active()
                    ->orderBy('order')
                    ->select('id', 'name', 'parent_id');
            }])
            ->orderBy('order')
            ->get(['id', 'name']);
    }


    public function storeCategory(array $data): ProductCategory
    {
        // 1. Manejo de la imagen en la nube (GCS)
        if (isset($data['image']) && $data['image'] instanceof UploadedFile) {

            $data['image'] = $this->gcsService->uploadFile($data['image'], 'products/categories');
        }

        // 2. Validación de nivel (Seguridad extra aparte del Request)
        if (!empty($data['parent_id'])) {
            $parent = ProductCategory::findOrFail($data['parent_id']);
            if (!$parent->canCreateChild()) {
                throw new \Exception("No se puede crear una categoría en este nivel (Máximo 2).");
            }
        }

        // 3. Crear (El Observer asignará el 'order' automáticamente)
        return ProductCategory::create($data);
    }
    public function updateCategory(ProductCategory $category, array $data): array
    {
        // 1. GCS (Igual que antes)
        if (array_key_exists('image', $data)) {
            if ($data['image'] instanceof UploadedFile) {
                if ($category->image) $this->gcsService->deleteFromPublicUrl($category->image);
                $data['image'] = $this->gcsService->uploadFile($data['image'], 'products/categories');
            } elseif (is_null($data['image'])) {
                if ($category->image) $this->gcsService->deleteFromPublicUrl($category->image);
            } else {
                unset($data['image']);
            }
        }

        // 2. Validación de nivel (Igual que antes)
        $newParentId = $data['parent_id'] ?? $category->parent_id;
        if ($newParentId !== $category->parent_id && !empty($newParentId)) {
            $parent = ProductCategory::findOrFail($newParentId);
            if (!$parent->canCreateChild()) {
                return ['success' => false, 'error' => "Esto es una subcategoría, elige una categoria."];
            }
        }

        // 3. Guardar datos básicos excepto 'order'
        $newOrder = isset($data['order']) ? (int) $data['order'] : null;
        unset($data['order']);

        $category->update($data);

        // 4. Reordenar si se pidió un nuevo orden
        if ($newOrder !== null) {

            // traer todos los hermanos (mismo parent_id) ya ordenados
            $siblings = ProductCategory::query()
                ->where('parent_id', $category->parent_id)
                ->ordered()
                ->pluck('id')
                ->toArray();

            // eliminar el current id para insertarlo luego
            $siblings = array_values(array_filter($siblings, fn($id) => $id !== $category->id));

            // insertar el id en la posición correcta (position 1 = índice 0)
            array_splice($siblings, max(0, $newOrder - 1), 0, $category->id);

            // aplicar nuevo orden
            ProductCategory::setNewOrder($siblings);
        }
        return ['success' => true];
    }

    public function deleteCategory(ProductCategory $category): void
    {
        if ($category->image) {
            $this->gcsService->deleteFromPublicUrl($category->image);
        }

        $category->delete();
    }


    /**
     * Obtener solo categorías raíz que tengan hijos activos.
     * Útil para la creación de productos.
     */
    public function getActiveParentsWithChildren(): Collection
    {
        return ProductCategory::roots()
            ->active()
            ->withWhereHas('children', fn($q) => $q->active()->orderBy('order')->select('id', 'name', 'parent_id', 'order'))
            ->orderBy('order')
            ->get(['id', 'name', 'parent_id', 'order']);
    }
}
