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
    $search = $request->query('search', ''); // <--- captura la query search
    $query = Blog::with(['categories:id,name', 'metadata'])
      ->where('visibility', true)
      ->latest();

    // Aplicar búsqueda por título o descripción si existe search
    if (!empty($search)) {
      $query->where(function ($q) use ($search) {
        $q->whereRaw(
          "to_tsvector('spanish', title || ' ' || description) @@ plainto_tsquery('spanish', ?)",
          [$search]
        )->orWhere('title', 'ILIKE', "%{$search}%")
          ->orWhere('description', 'ILIKE', "%{$search}%")
          ->orWhereHas('categories', function ($q2) use ($search) {
            $q2->whereRaw(
              "to_tsvector('spanish', name) @@ plainto_tsquery('spanish', ?)",
              [$search]
            );
          });
      });
    }

    // Traer blogs visibles, con relaciones y ordenados por fecha
    $blogs = $query->paginate($perPage);


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
  public function show($slug)
  {
    // Traer blog visible con relaciones
    $blog = Blog::with(['categories:id,name'])
      ->where('slug', $slug)
      ->where('visibility', true)
      ->firstOrFail();

    // Ocultar pivot en categories
    $blog->categories->makeHidden('pivot');

    return $this->success('Detalle del blog', $blog);
  }
}
