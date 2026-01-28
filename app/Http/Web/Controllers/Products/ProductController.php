<?php

namespace App\Http\Web\Controllers\Products;

use App\Enums\OgType;
use App\Http\Web\Controllers\Controller;
use App\Http\Web\Requests\Products\StoreProductRequest;
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

  /**
   * Listar productos
   */
  public function index()
  {
    $perPage = request()->input('per_page', 10);

    $products = Product::with([
      'category:id,name',
      'variants',
      'media' => function ($q) {
        $q->images()->main();
      }
    ])
      ->orderByDesc('created_at')
      ->paginate($perPage);

    return Inertia::render('products/Index', [
      'products' => $products,
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
        Log::info('Creando producto con los datos:', $request->validated());

    $this->productService->create($request->validated());

    return redirect()
      ->route('products.items.index')
      ->with('success', 'Producto creado correctamente');
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
