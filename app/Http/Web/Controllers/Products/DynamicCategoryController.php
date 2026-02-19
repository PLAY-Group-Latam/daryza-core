<?php

namespace App\Http\Web\Controllers\Products;

use App\Http\Web\Controllers\Controller;
use App\Http\Web\Services\Products\ProductSearchService;
use App\Models\Products\DynamicCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DynamicCategoryController extends Controller
{
  protected $searchService;

  public function __construct(ProductSearchService $searchService)
  {
    $this->searchService = $searchService;
  }

  /**
   * Listado de Categorías Dinámicas
   */
  public function index()
  {
    $perPage = request()->input('per_page', 10);

    // Cargamos con conteo de items para mostrar en la tabla principal
    $categories = DynamicCategory::withCount('items')
      ->latest()
      ->paginate($perPage)
      ->withQueryString();

    return Inertia::render('products/dynamicCategories/Index', [
      'paginatedCategories' => $categories,
    ]);
  }

  /**
   * Formulario de creación
   */
  public function create(Request $request): Response
  {
    $search = trim($request->input('q', ''));
    $searchResults = $this->searchService->searchVariantsBySku($search);

    return Inertia::render('products/dynamicCategories/Create', [
      'searchResults' => $searchResults,
      'filters' => ['q' => $search]
    ]);
  }

  /**
   * Guardar Categoría
   */
  public function store(Request $request)
  {
    $validated = $request->validate([
      'name'        => 'required|string|max:255',
      'slug'        => 'required|string|max:255|unique:dynamic_categories,slug',
      'is_active'   => 'boolean',
      'starts_at'   => 'required|date',
      'ends_at'     => 'required|date|after_or_equal:starts_at',
      'items'              => 'required|array|min:1',
      'items.*.variant_id' => 'required|exists:product_variants,id',
      'items.*.product_id' => 'required|exists:products,id',
    ]);

    DB::transaction(function () use ($validated) {
      $category = DynamicCategory::create(collect($validated)->except('items')->toArray());

      foreach ($validated['items'] as $item) {
        $category->items()->create([
          'product_id' => $item['product_id'],
          'variant_id' => $item['variant_id'],
        ]);
      }
    });
    return redirect()->route('products.dynamic-categories.index')
      ->with('success', 'Categoría dinámica creada con éxito.');
  }

  /**
   * Formulario de edición
   */
  public function edit(Request $request, DynamicCategory $dynamicCategory): Response
  {
    $search = trim($request->input('q', ''));
    $searchResults = $this->searchService->searchVariantsBySku($search);

    // Cargamos los items con sus variantes y atributos para el frontend
    $dynamicCategory->load(['items.variant.product', 'items.variant.attributes']);

    return Inertia::render('products/dynamicCategories/Edit', [
      'category' => [
        ...$dynamicCategory->toArray(),
        // Formateo para DatePickers de React
        'starts_at' => $dynamicCategory->starts_at?->format('Y-m-d\TH:i'),
        'ends_at'   => $dynamicCategory->ends_at?->format('Y-m-d\TH:i'),
        // Formateamos para que SelectedVariantsTable lo lea igual que en el buscador
        'items' => $dynamicCategory->items->map(fn($item) => [
          'id'           => $item->variant_id, // ID de la variante para el checkbox/remove
          'variant_id'   => $item->variant_id,
          'product_id'   => $item->product_id,
          'sku'          => $item->variant->sku,
          'product_name' => $item->variant->product->name,
          'variant_name' => "(" . ($item->variant->attributes->pluck('value')->implode('-') ?: 'Única') . ")",
        ]),

      ],
      'searchResults' => $searchResults,
      'filters' => ['q' => $search]
    ]);
  }

  /**
   * Actualizar Categoría
   */
  public function update(Request $request, DynamicCategory $dynamicCategory)
  {
    $validated = $request->validate([
      'name'        => 'required|string|max:255',
      'slug'        => 'required|string|max:255|unique:dynamic_categories,slug,' . $dynamicCategory->id,
      'is_active'   => 'boolean',
      'starts_at'   => 'required|date',
      'ends_at'     => 'required|date|after_or_equal:starts_at',

      // Ahora validamos 'items' como array de objetos, igual que el store
      'items'              => 'required|array|min:1',
      'items.*.variant_id' => 'required|exists:product_variants,id',
      'items.*.product_id' => 'required|exists:products,id',
    ]);

    DB::transaction(function () use ($validated, $dynamicCategory) {
      // Actualizamos los datos de la categoría exceptuando los items
      $dynamicCategory->update(collect($validated)->except('items')->toArray());

      // Sincronización limpia: Borramos anteriores y creamos nuevos desde el array items
      $dynamicCategory->items()->delete();

      foreach ($validated['items'] as $item) {
        $dynamicCategory->items()->create([
          'product_id' => $item['product_id'],
          'variant_id' => $item['variant_id'],
        ]);
      }
    });

    // En update()
    return redirect()->route('products.dynamic-categories.index')
      ->with('success', "Categoría '{$dynamicCategory->name}' actualizada correctamente.");
  }

  public function destroy(DynamicCategory $dynamicCategory)
  {
    try {
      DB::transaction(function () use ($dynamicCategory) {
        $dynamicCategory->items()->delete();
        $dynamicCategory->delete();
      });
      // En destroy()
      return redirect()->route('products.dynamic-categories.index')
        ->with('success', 'Categoría eliminada con éxito.');
    } catch (\Exception $e) {
      return redirect()->back()->with('error', 'No se pudo eliminar la categoría.');
    }
  }
}
