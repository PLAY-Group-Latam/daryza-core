<?php

namespace App\Http\Web\Controllers\Blogs;

use App\Http\Web\Controllers\Controller;
use App\Http\Web\Requests\Blogs\BlogRequest;
use App\Http\Web\Requests\Blogs\UpdateBlogRequest;
use App\Http\Web\Services\Blog\BlogService;
use App\Models\Blogs\Blog;
use App\Models\Blogs\BlogCategory;

use Inertia\Inertia;

class BlogController extends Controller
{
  /**
   * Listado de blogs con paginación
   */
  public function index()
  {
    $perPage = request()->input('per_page', 10);

    // Traer blogs con categorías y metadata
    $blogs = Blog::with('categories', 'metadata')
      ->latest()
      ->paginate($perPage)
      ->withQueryString();

    return Inertia::render('blogs/Index', [
      'paginatedBlogs' => $blogs,
    ]);
  }


  /**
   * Formulario para crear blog
   */
  public function create()
  {
    $categories = BlogCategory::select('id', 'name')->get();

    return Inertia::render('blogs/Create', [
      'categories' => $categories,
    ]);
  }


  /**
   * Guardar un nuevo blog
   */
  public function store(BlogRequest $request, BlogService $blogService)
  {
    $data = $request->validated();

    $blogService->save($data);

    return redirect()->route('blogs.items.index')
      ->with('success', 'Blog creado correctamente.');
  }

  /**
   * Formulario para editar blog
   */
  public function edit(Blog $blog)
  {
    $categories = BlogCategory::all();
    $blog->load('categories', 'metadata');

    return Inertia::render('blogs/Edit', [
      'categories' => $categories,
      'blog' => $blog
    ]);
  }
  public function update(UpdateBlogRequest $request, Blog $blog, BlogService $blogService)
  {

    $data = $request->validated();

    $blogService->save($data, $blog);

    return redirect()->route('blogs.items.index')
      ->with('success', 'Blog actualizado correctamente.');
  }

  /**
   * Eliminar blog (soft delete)
   */
  public function destroy(Blog $blog)
  {
    // Soft delete
    $blog->delete();

    // Retornar respuesta para Inertia (si se usa botón de eliminar en la tabla)
    return redirect()->route('blogs.items.index')
      ->with('success', 'Blog eliminado correctamente.');
  }
}
