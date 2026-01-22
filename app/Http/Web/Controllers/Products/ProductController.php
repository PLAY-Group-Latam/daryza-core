<?php

namespace App\Http\Web\Controllers\Products;

use App\Http\Web\Controllers\Controller;
use App\Models\Products\Product;
use App\Models\Products\ProductCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProductController extends Controller
{
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

    return Inertia::render('products/Create', [
      'categories' => $categoriesForSelect,
    ]);
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
