<?php

namespace App\Http\Web\Controllers\Products;

use App\Http\Web\Controllers\Controller;
use App\Http\Web\Requests\Products\StoreDynamicCategoryRequest;
use App\Http\Web\Requests\Products\UpdateDynamicCategoryRequest;
use App\Http\Web\Services\Products\DynamicCategoryService;
use App\Http\Web\Services\Products\ProductSearchService;
use App\Models\Products\DynamicCategory;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class DynamicCategoryController extends Controller
{
  protected $searchService;
  protected DynamicCategoryService $dynamicCategoryService;

  public function __construct(ProductSearchService $searchService, DynamicCategoryService $dynamicCategoryService)
  {
    $this->searchService = $searchService;
    $this->dynamicCategoryService = $dynamicCategoryService;
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
  public function store(StoreDynamicCategoryRequest $request)
  {
    try {
      $this->dynamicCategoryService->create($request->validated());
    } catch (ValidationException $e) {
      return back()->withErrors($e->errors())->withInput();
    }

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
    $dynamicCategory->load(['items.variant.product', 'items.variant.attributes', 'items.variant.mainImage']);

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
          'image'        => $item->variant->mainImage?->file_path,
        ]),

      ],
      'searchResults' => $searchResults,
      'filters' => ['q' => $search]
    ]);
  }

  /**
   * Actualizar Categoría
   */
  public function update(UpdateDynamicCategoryRequest $request, DynamicCategory $dynamicCategory)
  {
    try {
      $this->dynamicCategoryService->update($dynamicCategory, $request->validated());
    } catch (ValidationException $e) {
      return back()->withErrors($e->errors())->withInput();
    }

    // En update()
    return redirect()->route('products.dynamic-categories.index')
      ->with('success', "Categoría '{$dynamicCategory->name}' actualizada correctamente.");
  }

  public function destroy(DynamicCategory $dynamicCategory)
  {
    try {
      $this->dynamicCategoryService->delete($dynamicCategory);
      // En destroy()
      return redirect()->route('products.dynamic-categories.index')
        ->with('success', 'Categoría eliminada con éxito.');
    } catch (\Exception $e) {
      return redirect()->back()->with('error', 'No se pudo eliminar la categoría.');
    }
  }
}
