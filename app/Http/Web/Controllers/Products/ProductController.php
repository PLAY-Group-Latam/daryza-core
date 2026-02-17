<?php

namespace App\Http\Web\Controllers\Products;

use App\Http\Web\Controllers\Controller;
use App\Http\Web\Requests\Products\StoreProductRequest;
use App\Http\Web\Requests\Products\UpdateProductRequest;
use App\Http\Web\Services\Products\ProductCategoryService;
use App\Http\Web\Services\Products\ProductService;
use App\Models\Products\Attribute;
use App\Models\Products\BusinessLine;
use App\Models\Products\Product;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ProductController extends Controller
{

  protected ProductService $productService;
  protected ProductCategoryService $categoryService;

  /**
   * Inyectamos el servicio en el constructor
   */
  public function __construct(ProductService $productService, ProductCategoryService $categoryService)
  {
    $this->productService = $productService;
    $this->categoryService = $categoryService;
  }





  public function index()
  {
    $perPage = request()->input('per_page', 10);

    $products = Product::with([
      'variants' => function ($q) {
        $q->with([
          'attributes.attribute',
          'media',
        ]);
      },

    ])
      ->latest()
      ->paginate($perPage);


    return Inertia::render('products/Index', [
      'products' => $products,
    ]);
  }

  public function edit(Product $product)
  {

    $product->load([
      'categories', // <--- CARGAR LA RELACIÓN PIVOT      'metadata',
      'businessLines', // <--- AGREGADO: Cargar relación
      'technicalSheets',
      'variants.selections.attributeValue', // ← Usamos selections
      'variants.media',
      'variants.specifications.attribute',

    ]);
    Log::info('[Product EDIT] Loaded product', [
      'product' => $product->toArray(),
    ]);

    $productForForm = [
      'id' => $product->id,
      'name' => $product->name,
      'slug' => $product->slug,
      'categories' => $product->categories->pluck('id')->toArray(),
      'business_lines' => $product->businessLines->pluck('id')->toArray(),
      'brief_description' => $product->brief_description,
      'description' => $product->description,
      'is_active' => $product->is_active,
      'is_home' => $product->is_home,

      'metadata' => $product->metadata ? [
        'meta_title' => $product->metadata->meta_title,
        'meta_description' => $product->metadata->meta_description,
        'canonical_url' => $product->metadata->canonical_url,
        'og_title' => $product->metadata->og_title,
        'og_description' => $product->metadata->og_description,
        'noindex' => (bool) $product->metadata->noindex,
        'nofollow' => (bool) $product->metadata->nofollow,
      ] : null,

      'variants' => $product->variants->map(function ($variant) {
        return [
          'sku' => $variant->sku,
          'sku_supplier' => $variant->sku_supplier,
          'price' => (float) $variant->price,
          'promo_price' => $variant->promo_price
            ? (float) $variant->promo_price
            : null,
          'is_on_promo' => (bool) $variant->is_on_promo,
          'promo_start_at' => optional($variant->promo_start_at)?->toISOString(),
          'promo_end_at' => optional($variant->promo_end_at)?->toISOString(),
          'stock' => (int) $variant->stock,
          'is_active' => true,
          'is_main' => (bool) $variant->is_main,
          'media' => $variant->media,


          'attributes' => $variant->selections->map(function ($sel) {
            return [
              'attribute_id' => $sel->attributeValue->attribute_id,
              'attribute_value_id' => $sel->attribute_value_id,

            ];
          })->values(),
          // ✅ NUEVO: Especificaciones técnicas mapeadas DENTRO de la variante
          'specifications' => $variant->specifications->map(fn($spec) => [
            'attribute_id' => $spec->attribute_id,
            'value' => $spec->value, // Como acordamos, solo manejamos string
          ])->values(),

          'specification_selector' => '', // Valor
        ];
      })->values(),

      'variant_attribute_ids' => $product->variants
        ->flatMap(
          fn($variant) =>
          $variant->attributes
            ->map(fn($attrValue) => $attrValue->attribute->id)
        )
        ->unique()
        ->values(),



      'technicalSheets' => $product->technicalSheets->map(function ($sheet) {
        return [
          'file_path' => $sheet->file_path,
        ];
      })->values(),

    ];
    $categoriesForSelect = $this->categoryService->getActiveParentsWithChildren();


    $attributes = Attribute::with(['values'])->get();
    $businessLines = BusinessLine::where('is_active', true)
      ->latest()
      ->get(['id', 'name']);

    return Inertia::render('products/Edit', [
      'product' => $productForForm,
      'categories' => $categoriesForSelect,
      'attributes' => $attributes,
      'businessLines' => $businessLines, // <--- Pasar a la vista
    ]);
  }


  /**
   * Mostrar formulario de creación
   */
  public function create()
  {
    // Necesitas categorías para el select
    $categoriesForSelect = $this->categoryService->getActiveParentsWithChildren();

    $attributes = Attribute::with(['values'])
      ->get();
    $businessLines = BusinessLine::where('is_active', true)
      ->latest()
      ->get(['id', 'name']);

    return Inertia::render('products/Create', [
      'categories' => $categoriesForSelect,
      'attributes' => $attributes,
      'businessLines' => $businessLines, // Las pasamos a la vista
    ]);
  }



  public function store(StoreProductRequest $request)
  {
    // Log::info('Creando producto con los datos:', $request->validated());

    $this->productService->create($request->validated());

    return redirect()
      ->route('products.items.index')
      ->with('success', 'Producto creado correctamente');
  }

  public function update(UpdateProductRequest $request, Product $product)
  {
    $this->productService->update(
      $product,
      $request->validated()
    );

    return redirect()
      ->route('products.items.index')
      ->with('success', 'Producto actualizado correctamente');
  }

  /**
   * Eliminar una categoría
   * (gracias al cascade se borran sus hijas)
   */

  public function destroy(Product $product)
  {
    try {
      // Ejecutamos la lógica senior desde el servicio
      $this->productService->delete($product);

      return redirect()
        ->route('products.items.index')
        ->with('success', 'El producto ha sido movido a la papelera y desvinculado de sus categorías.');
    } catch (\Exception $e) {
      Log::error("Error al eliminar producto [{$product->id}]: " . $e->getMessage());

      return back()->withErrors([
        'message' => 'No se pudo eliminar el producto correctamente.'
      ]);
    }
  }
}
