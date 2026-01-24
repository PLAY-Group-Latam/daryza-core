<?php

namespace App\Http\Web\Controllers\Blogs;

use App\Http\Web\Controllers\Controller;
use App\Models\Blogs\BlogCategory;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class BlogCategoryController extends Controller
{
  /**
   * Listado de categorías con paginación
   */
  public function index(Request $request)
  {
    $perPage = $request->input('per_page', 10);

    // Traer categorías con posibilidad de ordenamiento por nombre
    $categories = BlogCategory::latest()
      ->paginate($perPage)
      ->withQueryString();

    return Inertia::render('blogs/categories/Index', [
      'paginatedCategories' => $categories,
    ]);
  }

  /**
   * Mostrar una categoría específica
   */
  // public function show($id)
  // {
  //   $category = BlogCategory::findOrFail($id);
  //   return response()->json($category);
  // }

  /**
   * Mostrar el formulario para crear una nueva categoría
   */
  public function create()
  {
    return Inertia::render('blogs/categories/Create');
  }


  /**
   * Crear una nueva categoría
   */
  public function store(Request $request)
  {
    $data = $request->validate([
      'name' => 'required|string|unique:blog_categories,name',
    ]);

    BlogCategory::create($data);

    return redirect()
      ->route('blogs.categories.index')
      ->with('success', 'Categoria de blog creado correctamente.');
  }

  /**
   * Mostrar el formulario para editar una categoría existente
   */
  public function edit($id)
  {
    $category = BlogCategory::findOrFail($id);

    return Inertia::render('blogs/categories/Edit', [
      'category' => $category,
    ]);
  }

  /**
   * Actualizar una categoría existente
   */
  public function update(Request $request, $id)
  {
    $category = BlogCategory::findOrFail($id);

    $request->validate([
      'name' => [
        'required',
        'string',
        Rule::unique('blog_categories', 'name')->ignore($category->id),
      ],
    ]);

    $category->update([
      'name' => $request->name,
    ]);


    return redirect()
      ->route('blogs.categories.index')
      ->with('success', 'Categoría actualizada correctamente.');
  }

  /**
   * Eliminar una categoría
   */
  public function destroy($id)
  {
    $category = BlogCategory::findOrFail($id);
    $category->delete();


    return redirect()
      ->route('blogs.categories.index')
      ->with('success', 'Categoría eliminada correctamente.');
  }
}
