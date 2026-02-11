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
    $search = $request->input('q');
    $results = [];

    if ($search) {
      $products = \App\Models\Products\Product::query()
        ->where('name', 'ilike', "%{$search}%")
        ->orWhere('code', 'ilike', "%{$search}%")
        ->with(['variants.attributeValues'])
        ->limit(10)
        ->get();

      // Formateamos igual que antes, pero esto se enviará como Prop de Inertia
      $results = $products->map(function ($product) {
        return [
          'id' => $product->id,
          'name' => $product->name,
          'variants' => $product->variants->map(function ($variant) {
            return [
              'id' => $variant->id,
              'sku' => $variant->sku,
              'name' => $variant->attributeValues->pluck('name')->implode(' - ') ?: "Variante {$variant->sku}",
            ];
          })
        ];
      });
    }

    return Inertia::render('products/dynamicCategories/Create', [
      'searchResults' => $results, // Aquí llegan los datos filtrados
      'filters' => $request->only(['q'])
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
   * Buscar productos y sus variantes para asignar a la categoría.
   */
  public function searchProducts(Request $request)
  {
    $search = $request->input('q');

    $products = \App\Models\Products\Product::query()
      ->where('name', 'ilike', "%{$search}%")
      ->orWhere('code', 'ilike', "%{$search}%") // Buscamos por código de producto
      ->with(['variants.attributeValues']) // Cargamos variantes y sus atributos (Rojo, 5L, etc)
      ->limit(10)
      ->get(['id', 'name']);

    $formatted = $products->map(function ($product) {
      return [
        'id' => $product->id,
        'name' => $product->name,
        'variants' => $product->variants->map(function ($variant) {
          // Obtenemos los nombres de los atributos (ej: "500ml", "Fragancia Limón")
          // y los unimos con un guion. Si no tiene, usamos el SKU.
          $attributesDescription = $variant->attributeValues->pluck('name')->implode(' - ');

          return [
            'id' => $variant->id,
            'sku' => $variant->sku,
            'name' => $attributesDescription ?: "Variante {$variant->sku}",
          ];
        })
      ];
    });

    return response()->json($formatted);
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
