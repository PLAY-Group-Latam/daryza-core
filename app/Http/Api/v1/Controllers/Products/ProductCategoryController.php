<?php

namespace App\Http\Api\v1\Controllers\Products;

use App\Http\Api\v1\Controllers\Controller;
use App\Models\Products\ProductCategory;
use Illuminate\Http\JsonResponse;

class ProductCategoryApiController extends Controller
{
  /**
   * Retorna todas las categorías activas en forma de árbol.
   */
  public function index()
  {
    $categories = ProductCategory::roots()
      ->active()
      ->with('activeChildren')
      ->get(['id', 'name', 'parent_id', 'order']);

    return $this->success('Categorias Obtenidas correctamente', $categories);
  }
}
