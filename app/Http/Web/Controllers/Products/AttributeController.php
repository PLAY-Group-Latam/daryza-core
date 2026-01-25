<?php

namespace App\Http\Web\Controllers\Products;

use App\Enums\AttributeType;
use App\Http\Web\Controllers\Controller;
use App\Http\Web\Requests\Products\Attributes\StoreAttributeRequest;
use App\Models\Products\Attribute;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules\Enum;
use Inertia\Inertia;

class AttributeController extends Controller
{
  public function index()
  {
    $perPage = request()->input('per_page', 10);

    $attributes = Attribute::with('values')
      ->latest()
      ->paginate($perPage);

    return Inertia::render('products/attributes/Index', [
      'paginatedAttributes' => $attributes,
    ]);
  }

  /**
   * Página para crear atributo
   */
  public function create()
  {
    return Inertia::render('products/attributes/Create', [
      'types' => AttributeType::options(),
    ]);
  }

  /**
   * Guardar atributo
   */
  public function store(StoreAttributeRequest $request)
  {
    $data = $request->validated();


    DB::transaction(function () use ($data) {
      $attribute = Attribute::create($data);


      if ($attribute->type === AttributeType::SELECT && !empty($data['values'])) {
        foreach ($data['values'] as $value) {
          $attribute->values()->create([
            'value' => $value,
          ]);
        }
      }
    });

    return redirect()
      ->route('products.attributes.index')
      ->with('success', 'Atributo creado correctamente.');
  }

  /**
   * Eliminar un atributo
   */
  public function destroy(Attribute $attribute)
  {
    DB::transaction(function () use ($attribute) {
      // Primero eliminamos los valores relacionados
      $attribute->values()->delete();

      // Luego eliminamos el atributo
      $attribute->delete();
    });

    return redirect()
      ->route('products.attributes.index')
      ->with('success', 'Atributo eliminado correctamente.');
  }
}
