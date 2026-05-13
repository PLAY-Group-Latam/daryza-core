<?php

namespace App\Http\Web\Controllers\Products;

use App\Http\Web\Controllers\Controller;
use App\Http\Web\Requests\Products\StoreCategoryRequest;
use App\Http\Web\Requests\Products\UpdateCategoryRequest;
use App\Http\Web\Services\Products\ProductCategoryService;
use App\Models\Products\ProductCategory;
use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Log;
// use Illuminate\Support\Str;
use Inertia\Inertia;

class ProductCategoryController extends Controller
{
    protected $categoryService;

    public function __construct(ProductCategoryService $categoryService)
    {
        $this->categoryService = $categoryService;
    }
    /**
     * Listar categorías (árbol completo)
     */
// ProductCategoryController.php
public function index(Request $request)
{
    $search = $request->string('search')->trim()->value();

    $filters = [
        'per_page' => $request->integer('per_page', 10),
        'search'   => $search,
    ];

    // Si no hay búsqueda, nos aseguramos de que el servicio no reciba basura
    $paginatedTree = $this->categoryService->getPaginatedTree($filters);
    $treeForSelect = $this->categoryService->getActiveTreeForSelect();

    return Inertia::render('products/categories/Index', [
        'paginatedCategories' => $paginatedTree,
        'categoriesForSelect' => $treeForSelect,
        'filters'             => $filters, 
    ]);
}
    /**
     * Crear una categoría
     */
    public function store(StoreCategoryRequest $request)
    {
        try {
            $this->categoryService->storeCategory($request->validated());

            return redirect()->route('products.categories.index')
                ->with('success', 'Categoría creada correctamente.');
        } catch (\Exception $e) {
            return back()->withErrors(['parent_id' => $e->getMessage()]);
        }
    }

    /**
     * Mostrar el formulario de creación de categorías.
     */
    public function create()
    {
        $treeForSelect = $this->categoryService->getActiveTreeForSelect();

        return Inertia::render('products/categories/Create', [
            'categoriesForSelect' => $treeForSelect
        ]);
    }

    /**
     * Mostrar el formulario de edición.
     */
    public function edit(ProductCategory $category)
    {
        // 1. Obtenemos el árbol para el select (mismo que en create e index)
        $treeForSelect = $this->categoryService->getActiveTreeForSelect();

        // 2. Renderizamos la vista enviando ambos datos
        return Inertia::render('products/categories/Edit', [
            'category'            => $category,
            'categoriesForSelect' => $treeForSelect
        ]);
    }

    public function update(UpdateCategoryRequest $request, ProductCategory $category)
    {
        // Delegamos todo al servicio
        $result = $this->categoryService->updateCategory($category, $request->validated());

        if (!$result['success']) {
            return back()->withErrors(['parent_id' => $result['error']]);
        }

        return redirect()->route('products.categories.index')
            ->with('success', 'Categoría actualizada correctamente.');
    }



    /**
     * Eliminar una categoría
     * (gracias al cascade se borran sus hijas)
     */
    public function destroy(ProductCategory $category)
    {
        $this->categoryService->deleteCategory($category);

        return back()->with('success', 'Categoría eliminada correctamente.');
    }
}
