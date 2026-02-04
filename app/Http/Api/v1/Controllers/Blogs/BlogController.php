<?php

namespace App\Http\Api\v1\Controllers\Blogs;

use App\Http\Api\v1\Controllers\Controller;
use App\Models\Blogs\Blog;
use Illuminate\Http\Request;

class BlogController extends Controller
{
  /**
   * Listar blogs públicos con paginación
   */
  public function index(Request $request)
  {
    // Definir cuántos blogs por página, por defecto 10
    $perPage = $request->query('per_page', 10);

    // Traer blogs visibles, con relaciones y ordenados por fecha
    $blogs = Blog::with(['categories:id,name', 'metadata'])
      ->where('visibility', true)
      ->latest()
      ->paginate($perPage);

    $blogs->getCollection()->transform(function ($blog) {
      $blog->categories->makeHidden('pivot');
      return $blog;
    });

    return $this->success(
      'Listado de blogs',
      $blogs
    );
  }


  /**
   * Mostrar un solo blog por slug
   */
  // public function show($slug)
  // {
  //   $blog = Blog::with(['categories', 'metadata'])
  //     ->where('slug', $slug)
  //     ->firstOrFail();

  //   return response()->json($blog);
  // }
}
