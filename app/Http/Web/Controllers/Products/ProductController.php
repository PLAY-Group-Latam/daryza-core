<?php

namespace App\Http\Web\Controllers\Products;

use App\Enums\OgType;
use App\Http\Web\Controllers\Controller;
use App\Http\Web\Requests\Products\StoreProductImportRequest;
use App\Http\Web\Requests\Products\StoreProductRequest;
use App\Http\Web\Requests\Products\UpdateProductRequest;
use App\Http\Web\Services\Products\ProductService;
use App\Models\Products\Attribute;
use App\Models\Products\Product;
use App\Models\Products\ProductCategory;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ProductController extends Controller
{

  protected ProductService $productService;
  /**
   * Inyectamos el servicio en el constructor
   */
  public function __construct(ProductService $productService)
  {
    $this->productService = $productService;
  }




  public function index()
  {
    $perPage = request()->input('per_page', 10);

    $products = Product::with([
      'category:id,name,slug',
      'variants' => function ($q) {
        $q->with([
          'attributeValues.attribute',
          'media',
        ]);
      },
      'technicalSheets',
      'specifications.attribute',
      'metadata',
    ])
      ->latest()
      ->paginate($perPage);

    // Transformación opcional para frontend
    // $products->getCollection()->transform(function ($product) {
    //   return [
    //     'id' => $product->id,
    //     'name' => $product->name,
    //     'slug' => $product->slug,
    //     'category' => $product->category,
    //     'brief_description' => $product->brief_description,
    //     'description' => $product->description,
    //     'is_active' => $product->is_active,
    //     'variants' => $product->variants->map(function ($variant) {
    //       return [
    //         'id' => $variant->id,
    //         'sku' => $variant->sku,
    //         'price' => $variant->price,
    //         'promo_price' => $variant->promo_price,
    //         'is_on_promo' => $variant->is_on_promo,
    //         'stock' => $variant->stock,
    //         'attributes' => $variant->attributeValues->map(function ($attr) {
    //           return [
    //             'attribute_id' => $attr->attribute->id,
    //             'attribute_name' => $attr->attribute->name,
    //             'attribute_value_id' => $attr->id,
    //             'attribute_value' => $attr->value,
    //           ];
    //         }),
    //         'media' => $variant->media,
    //       ];
    //     }),
    //     'technicalSheets' => $product->technicalSheets,
    //     'specifications' => $product->specifications->map(function ($spec) {
    //       return [
    //         'attribute_id' => $spec->attribute_id,
    //         'attribute_name' => $spec->attribute?->name,
    //         'value' => $spec->value,
    //       ];
    //     }),
    //     'metadata' => $product->metadata,
    //     'created_at' => $product->created_at, // fecha de creación
    //     'updated_at' => $product->updated_at, // fecha de actualización
    //   ];
    // });

    return Inertia::render('products/Index', [
      'products' => $products,
    ]);
  }

  public function edit(Product $product)
  {
  
    $product->load([
      'category',
      'metadata',
      'technicalSheets',
      'variants.variantAttributeValues.attributeValue.attribute',
      'variants.media',
      'specifications.attribute',
      'specifications.attributeValue',
    ]);
    Log::info('[Product EDIT] Loaded product', [
      'product' => $product->toArray(),
    ]);

    $productForForm = [
      'id' => $product->id,
      'name' => $product->name,
      'slug' => $product->slug,
      'category_id' => $product->category_id,
      'brief_description' => $product->brief_description,
      'description' => $product->description,
      'is_active' => $product->is_active,

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

          // 👇 ZOD-COMPATIBLE
          'attributes' => $variant->attributeValues->map(function ($attrValue) {
            return [
              'attribute_id' => $attrValue->attribute->id,
              'attribute_value_id' => $attrValue->id,
              'value' => $attrValue->value,
            ];
          })->values(),
        ];
      })->values(),

      'variant_attribute_ids' => $product->variants
        ->flatMap(
          fn($variant) =>
          $variant->attributeValues
            ->map(fn($attrValue) => $attrValue->attribute->id)
        )
        ->unique()
        ->values(),



      'technicalSheets' => $product->technicalSheets->map(function ($sheet) {
        return [
          'file_path' => $sheet->file_path,
        ];
      })->values(),
      'specifications' => $product->specifications->map(fn($spec) => [
        'attribute_id' => $spec->attribute_id,
        'value' => $spec->value,
      ])->values(),
    ];
    $categoriesForSelect = ProductCategory::roots()
      ->active()
      ->with('activeChildren')
      ->get(['id', 'name', 'parent_id', 'order']);

    $attributes = Attribute::with(['values'])->get();

    return Inertia::render('products/Edit', [
      'product' => $productForForm,
      'categories' => $categoriesForSelect,
      'attributes' => $attributes,
    ]);
  }


  /**
   * Mostrar formulario de creación
   */
  public function create()
  {
    // Necesitas categorías para el select
    $categoriesForSelect = ProductCategory::roots()
      ->active()
      ->with('activeChildren')
      ->get(['id', 'name', 'parent_id', 'order']);

    $attributes = Attribute::with(['values'])
      ->get();


    return Inertia::render('products/Create', [
      'categories' => $categoriesForSelect,
      'attributes' => $attributes,

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
  public function destroy($id)
  {
    $category = Product::findOrFail($id);
    $category->delete();

    return back()->with('success', 'Categoría eliminada correctamente.');
  }
}
