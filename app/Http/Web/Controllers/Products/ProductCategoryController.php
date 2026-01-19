<?php

namespace App\Http\Web\Controllers\Products;

use App\Http\Web\Controllers\Controller;
use App\Http\Web\Requests\Products\StoreCategoryRequest;
use App\Http\Web\Requests\Products\UpdateCategoryRequest;
use App\Http\Web\Services\Products\ProductCategoryService;
use App\Models\Products\ProductCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProductCategoryController extends Controller
{
    /**
     * Listar categorías (árbol completo)
     */
    public function index()
    {
        $perPage = request()->input('per_page', 10);

        $categories = ProductCategory::roots()
            ->with('children')
            ->orderBy('order', 'desc')
            ->paginate($perPage);

        $categoriesForSelect = ProductCategory::roots()
            ->active()
            ->with('activeChildren')
            ->get(['id', 'name', 'parent_id', 'order']);


        return Inertia::render('products/categories/Index', [
            'paginatedProductCategories' => $categories,
            'categoriesForSelect' => $categoriesForSelect,
        ]);
    }

    /**
     * Crear una categoría
     */
    public function store(StoreCategoryRequest $request)
    {
        $data = $request->validated();
        $data['order'] = $data['order'] ?? 0;


        // Validación del padre (máximo 2 niveles)
        if (!empty($data['parent_id'])) {
            $parent = ProductCategory::with('parent.parent')->findOrFail($data['parent_id']);

            if (!$parent->canCreateChild()) {
                return back()->withErrors([
                    'parent_id' => 'No se puede crear una categoría en este nivel. El máximo permitido es de 2 niveles.'
                ]);
            }

            // Asignamos el order automáticamente como el último entre los hijos del padre
            $maxOrder = ProductCategory::where('parent_id', $data['parent_id'])->max('order');
            $data['order'] = $maxOrder ? $maxOrder + 1 : 1;
        } else {
            // Es categoría padre, asignamos order entre los padres
            $maxOrder = ProductCategory::whereNull('parent_id')->max('order');
            $data['order'] = $maxOrder ? $maxOrder + 1 : 1;
        }

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('categories', 'public');
        }


        ProductCategory::create($data);

        return back()->with('success', 'Categoría creada correctamente.');
    }

    public function update(UpdateCategoryRequest $request, $id, ProductCategoryService $service)
    {
        $category = ProductCategory::findOrFail($id);
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('categories', 'public');
        }

        if (!empty($data['parent_id'])) {
            $parent = ProductCategory::findOrFail($data['parent_id']);
            if (!$parent->canCreateChild()) {
                return back()->withErrors([
                    'parent_id' => 'No se puede asignar esta categoría como padre. El máximo permitido es de 2 niveles.'
                ]);
            }
        }

        $result = $service->updateCategory($category, $data);

        if (!$result['success']) {
            return back()->withErrors(['order' => $result['error']]);
        }

        return back()->with('success', 'Categoría actualizada correctamente.');
    }



    /**
     * Eliminar una categoría
     * (gracias al cascade se borran sus hijas)
     */
    public function destroy($id)
    {
        $category = ProductCategory::findOrFail($id);
        $category->delete();

        return back()->with('success', 'Categoría eliminada correctamente.');
    }
}
