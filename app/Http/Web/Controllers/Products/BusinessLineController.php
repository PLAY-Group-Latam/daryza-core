<?php

namespace App\Http\Web\Controllers\Products;

use App\Http\Web\Controllers\Controller;
use App\Models\Products\BusinessLine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class BusinessLineController extends Controller
{
    public function index()
    {
        // Seguimos tu lógica: capturar per_page del request (por defecto 10)
        $perPage = request()->input('per_page', 10);

        $businessLines = BusinessLine::latest()
            ->paginate($perPage)
            ->withQueryString(); // Mantiene los filtros en la URL al cambiar de página

        return Inertia::render('products/businessLines/Index', [
            'paginatedBusinessLines' => $businessLines,
        ]);
    }
    public function create()
    {
        return Inertia::render('products/businessLines/Create');
    }
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:business_lines,name',
            'slug' => 'required|string|max:255|unique:business_lines,slug', // Validar slug
            'is_active' => 'boolean'
        ]);

        BusinessLine::create($validated);

        // REDIRECCIÓN PARA INERTIA
        return redirect()->route('products.business-lines.index')
            ->with('message', 'Línea de negocio creada con éxito');
    }


    public function edit(BusinessLine $businessLine)
    {
        return Inertia::render('products/businessLines/Edit', [
            'businessLine' => $businessLine
        ]);
    }

    public function update(Request $request, BusinessLine $businessLine)
    {
        $validated = $request->validate([
            'name'      => 'required|string|max:255|unique:business_lines,name,' . $businessLine->id,
            'slug'      => 'required|string|max:255|unique:business_lines,slug,' . $businessLine->id,
            'is_active' => 'boolean'
        ]);

        // Nota: Como quitamos el campo image del formulario, 
        // ya no procesamos archivos aquí para mantenerlo limpio.

        $businessLine->update($validated);

        return redirect()->route('products.business-lines.index')
            ->with('message', 'Línea de negocio actualizada con éxito');
    }
    public function destroy(BusinessLine $businessLine)
    {
        // Opcional: Evitar borrar si tiene productos asociados
        if ($businessLine->products()->exists()) {
            return response()->json(['message' => 'No se puede eliminar una línea con productos'], 422);
        }


        $businessLine->delete();

        return redirect()->route('products.business-lines.index')
            ->with('message', 'Línea de negocio eliminada correctamente');
    }
}
