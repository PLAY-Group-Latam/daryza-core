<?php

namespace App\Http\Web\Controllers\Products;

use App\Http\Web\Controllers\Controller;
use App\Models\Products\DynamicCategory;
use App\Models\Products\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

      $results = ProductVariant::query()
        // Añadimos campos de promoción al select
        ->select('id', 'product_id', 'sku', 'price', 'promo_price', 'is_on_promo')
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
          // Información de promoción
          'is_on_promo'  => $variant->is_on_promo,
          'product_name' => $variant->product?->name ?? 'Sin nombre',
          'variant_name'         => $variant->attributeValues->pluck('value')->implode(' - ') ?: "Variante única",

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
      'name'          => 'required|string|max:255',
      'slug'          => 'required|string|unique:dynamic_categories,slug',
      'is_active'     => 'boolean',
      'starts_at'     => 'nullable|date',
      'ends_at'       => 'nullable|date|after_or_equal:starts_at',
      'variant_ids'   => 'required|array|min:1',
      'variant_ids.*' => 'exists:product_variants,id',
    ]);

    return DB::transaction(function () use ($validated) {
      $dynamicCategory = DynamicCategory::create($validated);

      // --- AQUÍ ESTÁ LA CORRECCIÓN ---
      // 1. Buscamos los product_id únicos asociados a esas variantes
      $productIds = ProductVariant::whereIn('id', $validated['variant_ids'])
        ->pluck('product_id') // Obtenemos la columna product_id
        ->unique()            // Evitamos duplicados
        ->toArray();

      // 2. Sincronizamos usando los IDs de PRODUCTOS
      $dynamicCategory->variants()->sync($productIds);

      return redirect()->route('products.dynamic-categories.index')
        ->with('success', 'Categoría creada con éxito.');
    });
  }


  /**
   * Formulario de edición.
   */
  public function edit(Request $request, DynamicCategory $dynamicCategory)
  {
    // 1. Manejamos la búsqueda (igual que en create por si el usuario busca más productos al editar)
    $search = trim($request->input('q', ''));
    $searchResults = collect();

    if (strlen($search) >= 3) {
      $searchTerm = "%{$search}%";
      $searchResults = ProductVariant::query()
        ->select('id', 'product_id', 'sku', 'price', 'is_on_promo')
        ->where('sku', 'ilike', $searchTerm)
        ->with(['product:id,name', 'attributeValues:id,value'])
        ->limit(15)
        ->get()
        ->map(fn($variant) => [
          'id'           => $variant->id,
          'sku'          => $variant->sku,
          'price'        => $variant->price,
          'is_on_promo'  => $variant->is_on_promo,
          'product_name' => $variant->product?->name ?? 'Sin nombre',
          'variant_name' => $variant->attributeValues->pluck('value')->implode(' - ') ?: "Variante única",
        ]);
    }

    $selectedVariants = $dynamicCategory->products() // Usamos la relación corregida
      ->with(['variants.product', 'variants.attributeValues'])
      ->get()
      ->flatMap(function ($product) {
        // De cada producto asociado, sacamos TODAS sus variantes
        return $product->variants->map(function ($variant) {
          return [
            'id'           => $variant->id,
            'sku'          => $variant->sku,
            'price'        => $variant->price,
            'is_on_promo'  => $variant->is_on_promo,
            'product_name' => $variant->product?->name ?? 'Sin nombre',
            'variant_name' => $variant->attributeValues->pluck('value')->implode(' - ') ?: "Variante única",
          ];
        });
      });


    return Inertia::render('products/dynamicCategories/Edit', [
      'dynamicCategory' => [
        'id'          => $dynamicCategory->id,
        'name'        => $dynamicCategory->name,
        'slug'        => $dynamicCategory->slug,
        'is_active'   => $dynamicCategory->is_active,
        // Formateo ISO para inputs datetime-local de HTML5
        'starts_at'   => $dynamicCategory->starts_at?->format('Y-m-d\TH:i'),
        'ends_at'     => $dynamicCategory->ends_at?->format('Y-m-d\TH:i'),
        // Pasamos los IDs de las variantes para el estado inicial del formulario
        'variant_ids' => $selectedVariants->pluck('id'),
      ],
      'selectedVariants' => $selectedVariants,
      'searchResults'    => $searchResults,
      'filters'          => ['q' => $search]
    ]);
  }

  /**
   * Actualizar categoría existente.
   */
  /**
   * Actualizar categoría existente.
   */
  public function update(Request $request, DynamicCategory $dynamicCategory)
  {
    $validated = $request->validate([
      'name'          => 'required|string|max:255',
      'slug'          => 'required|string|unique:dynamic_categories,slug,' . $dynamicCategory->id,
      'banner_image'  => 'nullable|string',
      'is_active'     => 'boolean',
      'starts_at'     => 'nullable|date',
      'ends_at'       => 'nullable|date|after_or_equal:starts_at',
      'variant_ids'   => 'required|array|min:1',
      'variant_ids.*' => 'exists:product_variants,id',
    ]);

    return DB::transaction(function () use ($validated, $dynamicCategory) {
      // 1. Actualizar los datos básicos de la categoría
      $dynamicCategory->update($validated);

      // 2. Obtener los product_id únicos a partir de las variantes enviadas
      // Esto es necesario porque tu relación en el pivote es con 'product_id'
      $productIds = ProductVariant::whereIn('id', $validated['variant_ids'])
        ->pluck('product_id')
        ->unique()
        ->toArray();

      // 3. Sincronizar la tabla pivote (borra los que ya no están y agrega los nuevos)
      // Usamos la relación products() que definimos en el modelo
      $dynamicCategory->products()->sync($productIds);

      return redirect()->route('products.dynamic-categories.index')
        ->with('success', 'Categoría actualizada correctamente.');
    });
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
