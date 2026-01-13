<?php

namespace App\Http\Web\Controllers\Products;

use App\Http\Web\Controllers\Controller;
use App\Http\Web\Requests\Products\StoreCategoryRequest;
use App\Http\Web\Requests\Products\UpdateCategoryRequest;
use App\Models\Products\ProductCategory;
use Illuminate\Http\Request;
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

        $categories = ProductCategory::with('children.children')
            ->roots()
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        $categoriesForSelect = ProductCategory::active()
            ->select('id', 'name', 'parent_id', 'order')
            ->with([
                'children' => function ($q) {
                    $q->select('id', 'name', 'parent_id', 'order')
                        ->with([
                            'children' => function ($q) {
                                $q->select('id', 'name', 'parent_id', 'order');
                            }
                        ]);
                }
            ])
            ->roots()
            ->orderBy('order')
            ->get();


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

        if (!empty($data['parent_id'])) {
            $parent = ProductCategory::with('parent.parent')->findOrFail($data['parent_id']);

            if (!$parent->canCreateChild()) {
                return back()->withErrors([
                    'parent_id' => 'No se puede crear una categoría en este nivel. El máximo permitido es de 2 niveles.'
                ]);
            }
        }

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('categories', 'public');
        }


        ProductCategory::create($data);

        return back()->with('success', 'Categoría creada correctamente.');
    }

    public function update(UpdateCategoryRequest $request, $id)
    {
        $category = ProductCategory::findOrFail($id);

        // Validación
        $request->validate([
            'name'      => 'required|string|max:255',
            'slug'      => 'nullable|string|max:255|unique:product_categories,slug,' . $category->id,
            'image'     => 'nullable|file|image|max:2048', 
            'parent_id' => 'nullable|exists:product_categories,id|not_in:' . $category->id,
            'order'     => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $data = [
            'name'      => $request->name,
            'slug'      => $request->slug ?? Str::slug($request->name),
            'parent_id' => $request->parent_id,
            'order'     => $request->order ?? 0,
            'is_active' => $request->is_active ?? true,
        ];

        // Manejo de imagen
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('categories', 'public');
        }

        // Validación de jerarquía (no permitir más de 2 niveles)
        if (!empty($data['parent_id'])) {
            $parent = ProductCategory::with('parent')->findOrFail($data['parent_id']);
            if (!$parent->canCreateChild()) {
                return back()->withErrors([
                    'parent_id' => 'No se puede asignar esta categoría como padre. El máximo permitido es de 2 niveles.'
                ]);
            }
        }

        $category->update($data);

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
