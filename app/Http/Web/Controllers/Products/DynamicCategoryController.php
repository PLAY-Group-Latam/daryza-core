<?php

namespace App\Http\Web\Controllers\Products;

use App\Http\Web\Controllers\Controller;
use App\Models\Products\DynamicCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class DynamicCategoryController extends Controller
{
  /**
   * Listado de categorías especiales con paginación.
   */
  public function index()
  {
    $perPage = request()->input('per_page', 10);

    $categories = DynamicCategory::query()
      ->latest()
      ->paginate($perPage)
      ->withQueryString();

    return Inertia::render('products/dynamicCategories/Index', [
      'categories' => $categories
    ]);
  }

  /**
   * Formulario de creación.
   */
  // DynamicCategoryController.php

  public function create(Request $request)
  {
    $search = trim($request->input('q', ''));
    $results = collect();

    if (strlen($search) >= 3) {
      $searchTerm = "%{$search}%";

      // Buscamos directamente en la tabla de variantes
      $results = \App\Models\Products\ProductVariant::query()
        ->select('id', 'product_id', 'sku', 'price')
        ->where('sku', 'ilike', $searchTerm)
        ->with([
          'product:id,name',
          'attributeValues:id,value'
        ])
        ->limit(15)
        ->get()
        ->map(fn($variant) => [
          'id'           => $variant->id,
          'sku'          => $variant->sku,
          'price'        => $variant->price,
          // El nombre ahora incluye el producto para que el usuario no se pierda
          'product_name' => $variant->product?->name ?? 'Sin nombre',
          'name'         => $variant->attributeValues->pluck('value')->implode(' - ') ?: "Variante única",
        ]);
    }

    return Inertia::render('products/dynamicCategories/Create', [
      'searchResults' => $results,
      'filters'       => ['q' => $search]
    ]);
  }

  /**
   * Guardar nueva categoría.
   */
  public function store(Request $request)
  {
    $validated = $request->validate([
      'name'         => 'required|string|max:255',
      'slug'         => 'required|string|unique:dynamic_categories,slug',
      'is_active'    => 'boolean',
      'starts_at'    => 'nullable|date',
      'ends_at'      => 'nullable|date|after_or_equal:starts_at',
      'variant_ids' => 'required|array', // Array de IDs de variantes elegidas
      'variant_ids.*' => 'exists:product_variants,id',
    ]);

    DynamicCategory::create($validated);

    return redirect()->route('products.dynamic-categories.index')
      ->with('success', 'Categoría especial creada con éxito.');
  }


  /**
   * Formulario de edición.
   */
  public function edit(DynamicCategory $dynamicCategory)
  {
    return Inertia::render('products/dynamic-categories/Edit', [
      'category' => $dynamicCategory
    ]);
  }

  /**
   * Actualizar categoría existente.
   */
  public function update(Request $request, DynamicCategory $dynamicCategory)
  {
    $validated = $request->validate([
      'name'         => 'required|string|max:255',
      'slug'         => 'required|string|unique:dynamic_categories,slug,' . $dynamicCategory->id,
      'banner_image' => 'nullable|string',
      'is_active'    => 'boolean',
      'starts_at'    => 'nullable|date',
      'ends_at'      => 'nullable|date|after_or_equal:starts_at',
    ]);

    $dynamicCategory->update($validated);

    return redirect()->route('products.dynamic-categories.index')
      ->with('success', 'Categoría actualizada correctamente.');
  }

  /**
   * Eliminar categoría (Soft Delete).
   */
  public function destroy(DynamicCategory $dynamicCategory)
  {
    $dynamicCategory->delete();

    return redirect()->route('products.dynamic-categories.index')
      ->with('success', 'Categoría eliminada correctamente.');
  }
}
