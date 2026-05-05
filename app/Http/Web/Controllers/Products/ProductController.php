<?php

namespace App\Http\Web\Controllers\Products;

use App\Http\Web\Controllers\Controller;
use App\Http\Web\Requests\Products\StoreProductRequest;
use App\Http\Web\Requests\Products\UpdateProductRequest;
use App\Http\Web\Resources\MetadataResource;
use App\Http\Web\Services\Products\ProductCategoryService;
use App\Http\Web\Services\Products\ProductService;
use App\Models\Products\Attribute;
use App\Models\Products\BusinessLine;
use App\Models\Products\Brand;
use App\Models\Products\Product;
use Illuminate\Http\Request;
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





  public function index(Request $request)
  {
    $perPage = $request->input('per_page', 10);
    $search = trim((string) $request->input('search', ''));

    $products = Product::query()->with([
      'variants' => function ($q) {
        $q->orderBy('created_at', 'asc')
          ->orderBy('id', 'asc') // ← desempate estable
          ->with([
            'attributes.attribute',
            'media' => fn($q) => $q->orderBy('order', 'asc'),
          ]);
      },

    ])
      ->when($search !== '', function ($query) use ($search) {
        $term = "%{$search}%";

        $query->where(function ($q) use ($term) {
          $q->where('name', 'ilike', $term)
            ->orWhere('code', 'ilike', $term)
            ->orWhereHas('variants', function ($variantQuery) use ($term) {
              $variantQuery->where('sku', 'ilike', $term);
            });
        });
      })
      ->orderBy('created_at', 'desc')  // ← explícito y estable
      ->orderBy('id', 'desc') // ← desempate estable
      ->paginate($perPage);


    return Inertia::render('products/Index', [
      'products' => $products,
      'filters' => [
        'search' => $search,
      ],
    ]);
  }

  public function edit(Request $request, Product $product)
  {
    $recommendedSearch = trim((string) $request->input('recommended_q', ''));
    $recommendableSearchResults = $this->searchRecommendableProducts(
      $recommendedSearch,
      $request->query('exclude'),
      $product->id
    );

    $product->load([
      'categories.parent',
      'metadata',
      'businessLines', // <--- AGREGADO: Cargar relación
      'technicalSheets',
      'recommendedProducts:id,code,name,slug',
      'variants' => function ($q) {
        $q->orderBy('created_at', 'asc')
          ->orderBy('id', 'asc') // ← desempate estable
          ->with([
            'selections.attributeValue.attribute',
            'media'          => fn($q) => $q->orderBy('order', 'asc'),
            'specifications.attribute',
          ]);
      },

    ]);
    // Log::info('[Product EDIT] Loaded product', [
    //   'product' => $product->toArray(),
    // ]);

    $rootCategory = $product->categories->firstWhere('parent_id', null);
    $subcategories = $product->categories->filter(fn($category) => !is_null($category->parent_id));
    $inferredParentId = $rootCategory?->id
      ?? $subcategories->first()?->parent_id;

    $productForForm = [
      'id' => $product->id,
      'name' => $product->name,
      'slug' => $product->slug,
      'parent_category_id' => $inferredParentId,
      'categories' => $subcategories->pluck('id')->values()->toArray(),
      'business_lines' => $product->businessLines->pluck('id')->toArray(),
      'brand_id' => $product->brand_id,
      'recommended_product_ids' => $product->recommendedProducts->pluck('id')->toArray(),
      'recommended_products' => $product->recommendedProducts->map(fn($item) => [
        'id' => $item->id,
        'code' => $item->code,
        'name' => $item->name,
        'slug' => $item->slug,
      ])->values(),
      'brief_description' => $product->brief_description,
      'description' => $product->description,
      'is_active' => $product->is_active,
      'is_home' => $product->is_home,

      'metadata' => $product->metadata
        ? (new MetadataResource($product->metadata))->toArray(request())
        : null,

      'variants' => $product->variants->map(function ($variant) {
        return [
          'id' => $variant->id,
          'sku' => $variant->sku,
          'sku_supplier' => $variant->sku_supplier,
          'price'          => $variant->price,
          'promo_price'    => $variant->promo_price,
          'is_on_promo'    => $variant->is_on_promo,
          'promo_start_at' => $variant->promo_start_at?->toISOString(),
          'promo_end_at'   => $variant->promo_end_at?->toISOString(),
          'stock'          => $variant->stock,
          'is_active'      => $variant->is_active,
          'is_main'        => $variant->is_main,
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

          // 'specification_selector' => '', // Valor
        ];
      })->values(),

      'variant_attribute_ids' => $product->variants
        ->flatMap(function ($variant) {
          return $variant->selections
            ->map(fn($selection) => $selection->attributeValue?->attribute)
            ->filter(fn($attribute) => $attribute && (bool) ($attribute->is_variant ?? false))
            ->map(fn($attribute) => $attribute->id);
        })
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
      'brands' => Brand::where('is_active', true)->latest()->get(['id', 'name']),
      'recommendableSearchResults' => $recommendableSearchResults,
      'filters' => [
        'recommended_q' => $recommendedSearch,
      ],
    ]);
  }


  /**
   * Mostrar formulario de creación
   */
  public function create(Request $request)
  {
    $recommendedSearch = trim((string) $request->input('recommended_q', ''));
    $recommendableSearchResults = $this->searchRecommendableProducts(
      $recommendedSearch,
      $request->query('exclude')
    );

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
      'brands' => Brand::where('is_active', true)->latest()->get(['id', 'name']),
      'recommendableSearchResults' => $recommendableSearchResults,
      'filters' => [
        'recommended_q' => $recommendedSearch,
      ],
    ]);
  }



  public function store(StoreProductRequest $request)
  {
    // Log::info('Creando producto con los datos:', $request->validated());

    $this->productService->create(
      $request->validated(),
      $request->file('variants', [])
    );

    return redirect()
      ->route('products.items.index')
      ->with('success', 'Producto creado correctamente');
  }

  public function update(UpdateProductRequest $request, Product $product)
  {
    // dd([
    //   'all'      => $request->all(),
    //   'files'    => $request->allFiles(),
    //   'method'   => $request->method(),
    //   'content'  => $request->header('Content-Type'),
    // ]);
    $this->productService->update(
      $product,
      $request->validated(),
      $request->file('variants', [])
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

  private function searchRecommendableProducts(
    string $q,
    ?string $exclude = null,
    ?string $exceptProductId = null
  )
  {
    if (mb_strlen($q) < 2) {
      return collect();
    }

    $excludeIds = collect(explode(',', (string) $exclude))
      ->map(fn($id) => trim($id))
      ->filter()
      ->values();

    return Product::query()
      ->select('id', 'code', 'name', 'slug')
      ->where('is_active', true)
      ->when($exceptProductId, fn($query) => $query->where('id', '!=', $exceptProductId))
      ->when($excludeIds->isNotEmpty(), fn($query) => $query->whereNotIn('id', $excludeIds))
      ->where(function ($query) use ($q) {
        $query->where('name', 'like', "%{$q}%")
          ->orWhere('code', 'like', "%{$q}%")
          ->orWhere('slug', 'like', "%{$q}%");
      })
      ->orderBy('name')
      ->limit(15)
      ->get();
  }
}
