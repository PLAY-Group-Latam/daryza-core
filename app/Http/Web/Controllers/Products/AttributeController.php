<?php

namespace App\Http\Web\Controllers\Products;

use App\Enums\AttributeType;
use App\Http\Web\Controllers\Controller;
use App\Http\Web\Requests\Products\Attributes\StoreAttributeRequest;
use App\Http\Web\Requests\Products\Attributes\UpdateAttributeRequest;
use App\Models\Products\Attribute;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
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

    // Log::info('Lista de atributos: ' . json_encode($attributes->toArray()));


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
   * Página para editar atributo
   */
  public function edit(Attribute $attribute)
  {
    return Inertia::render('products/attributes/Edit', [
      'attribute' => $attribute->load('values'), // cargamos los valores existentes
      'types' => AttributeType::options(),
    ]);
  }

  public function update(UpdateAttributeRequest $request, Attribute $attribute)
  {
    $data = $request->validated();

    DB::transaction(function () use ($attribute, $data) {
      // Actualizamos el atributo
      $attribute->update($data);

      // Si es tipo SELECT, actualizamos los valores
      if ($attribute->type === AttributeType::SELECT) {
        $incomingValues = array_values($data['values'] ?? []);

        // Importante: mantenemos IDs existentes para no romper
        // las selecciones de variantes que dependen de attribute_value_id.
        $existingValues = $attribute->values()
          ->orderBy('created_at', 'asc')
          ->orderBy('id', 'asc')
          ->get()
          ->values();

        // Índice por valor actual para reusar el mismo registro cuando el
        // valor ya existe (aunque haya cambiado de posición en el formulario).
        $availableByValue = $existingValues
          ->groupBy('value')
          ->map(fn($items) => $items->values());

        $availableForUpdate = $existingValues->keyBy('id');
        $keptIds = [];
        $keptValueCounts = [];

        // Paso 1: reusar por coincidencia exacta de valor.
        foreach ($incomingValues as $value) {
          $bucket = $availableByValue->get($value);
          if (!$bucket || $bucket->isEmpty()) {
            continue;
          }

          $matched = $bucket->shift();
          $availableByValue->put($value, $bucket);
          $availableForUpdate->forget($matched->id);
          $keptIds[] = $matched->id;
          $keptValueCounts[$value] = ($keptValueCounts[$value] ?? 0) + 1;
        }

        // Paso 2: para valores nuevos, reutilizar registros sobrantes.
        foreach ($incomingValues as $value) {
          if (($keptValueCounts[$value] ?? 0) > 0) {
            $keptValueCounts[$value]--;
            continue;
          }

          $current = $availableForUpdate->shift();

          if ($current) {
            $current->update(['value' => $value]);
            $keptIds[] = $current->id;
            continue;
          }

          $created = $attribute->values()->create([
            'value' => $value,
          ]);
          $keptIds[] = $created->id;
        }

        // Si el usuario redujo la lista, eliminamos sobrantes no usados.
        if (!empty($keptIds)) {
          $attribute->values()->whereNotIn('id', $keptIds)->delete();
        } else {
          $attribute->values()->delete();
        }
      }
    });

    return redirect()
      ->route('products.attributes.index')
      ->with('success', 'Atributo actualizado correctamente.');
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
