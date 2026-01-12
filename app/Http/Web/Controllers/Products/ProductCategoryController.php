<?php

namespace App\Http\Web\Controllers\Products;

use App\Http\Web\Controllers\Controller;
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

        return Inertia::render('products/categories/Index', [
            'paginatedProductCategories' => $categories,
        ]);
    }

    // /**
    //  * Crear una categoría
    //  */
    // public function store(Request $request)
    // {
    //     $request->validate([
    //         'name'      => 'required|string|max:255',
    //         'slug'      => 'nullable|string|max:255|unique:product_categories,slug',
    //         'image'     => 'nullable|string',
    //         'parent_id' => 'nullable|exists:product_categories,id',
    //         'order'     => 'nullable|integer',
    //         'is_active' => 'nullable|boolean',
    //     ]);

    //     $category = ProductCategory::create([
    //         'name'      => $request->name,
    //         'slug'      => $request->slug ?? Str::slug($request->name),
    //         'image'     => $request->image,
    //         'parent_id' => $request->parent_id,
    //         'order'     => $request->order ?? 0,
    //         'is_active' => $request->is_active ?? true,
    //     ]);

    //     return response()->json([
    //         'message' => 'Categoría creada correctamente',
    //         'data'    => $category,
    //     ], 201);
    // }

    // /**
    //  * Mostrar una categoría
    //  */
    // public function show($id)
    // {
    //     $category = ProductCategory::with('parent', 'children')->findOrFail($id);

    //     return response()->json($category);
    // }

    // /**
    //  * Actualizar una categoría
    //  */
    // public function update(Request $request, $id)
    // {
    //     $category = ProductCategory::findOrFail($id);

    //     $request->validate([
    //         'name'      => 'required|string|max:255',
    //         'slug'      => 'nullable|string|max:255|unique:product_categories,slug,' . $category->id . ',id',
    //         'image'     => 'nullable|string',
    //         'parent_id' => 'nullable|exists:product_categories,id|not_in:' . $category->id,
    //         'order'     => 'nullable|integer',
    //         'is_active' => 'nullable|boolean',
    //     ]);

    //     $category->update([
    //         'name'      => $request->name,
    //         'slug'      => $request->slug ?? Str::slug($request->name),
    //         'image'     => $request->image,
    //         'parent_id' => $request->parent_id,
    //         'order'     => $request->order ?? 0,
    //         'is_active' => $request->is_active ?? true,
    //     ]);

    //     return response()->json([
    //         'message' => 'Categoría actualizada correctamente',
    //         'data'    => $category,
    //     ]);
    // }

    // /**
    //  * Eliminar una categoría
    //  * (gracias al cascade se borran sus hijas)
    //  */
    // public function destroy($id)
    // {
    //     $category = ProductCategory::findOrFail($id);
    //     $category->delete();

    //     return response()->json([
    //         'message' => 'Categoría eliminada correctamente'
    //     ]);
    // }
}
