<?php

namespace App\Http\Web\Controllers\Blogs;

use App\Http\Requests\BlogRequest;
use App\Http\Web\Controllers\Controller;
use App\Models\Blogs\Blog;
use App\Models\Blogs\BlogCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BlogController extends Controller
{
  /**
   * Listado de blogs con paginación
   */
  public function index()
  {
    // Paginación dinámica: ?per_page=15 en la URL
    $perPage = request()->input('per_page', 15);

    // Traer blogs con categorías y metadata
    $blogs = Blog::with('categories', 'metadata')
      ->latest()
      ->paginate($perPage)
      ->withQueryString(); // mantiene parámetros de query en paginación

    // Preparar los datos para Inertia
    return Inertia::render('blogs/Index', [
      'paginatedBlogs' => $blogs,
    ]);
  }


  /**
   * Formulario para crear blog
   */
  public function create()
  {
    return Inertia::render('blogs/Create');
  }

  /**
   * Guardar un nuevo blog
   */
  public function store(BlogRequest $request)
  {
    $data = $request->validated();

    $blog = Blog::create($data);

    // Asociar categorías
    if (isset($data['categories'])) {
      $blog->categories()->sync($data['categories']);
    }

    // Metadata polimórfica
    if (isset($data['metadata'])) {
      $blog->metadata()->create($data['metadata']);
    }

    return redirect()->route('admin.blogs.index')
      ->with('success', 'Blog creado correctamente.');
  }

  /**
   * Formulario para editar blog
   */
  public function edit(Blog $blog)
  {
    $categories = BlogCategory::all();
    $blog->load('categories', 'metadata');

    return view('admin.blogs.edit', compact('blog', 'categories'));
  }

  /**
   * Actualizar blog existente
   */
  public function update(BlogRequest $request, Blog $blog)
  {
    $data = $request->validated();

    $blog->update($data);

    // Actualizar categorías
    if (isset($data['categories'])) {
      $blog->categories()->sync($data['categories']);
    }

    // Actualizar o crear metadata
    if (isset($data['metadata'])) {
      if ($blog->metadata) {
        $blog->metadata->update($data['metadata']);
      } else {
        $blog->metadata()->create($data['metadata']);
      }
    }

    return redirect()->route('admin.blogs.index')
      ->with('success', 'Blog actualizado correctamente.');
  }

  /**
   * Eliminar blog (soft delete)
   */
  public function destroy(Blog $blog)
  {
    $blog->delete();
    return redirect()->route('admin.blogs.index')
      ->with('success', 'Blog eliminado correctamente.');
  }
}
