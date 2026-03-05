<?php

namespace App\Http\Web\Controllers\Products;

use App\Http\Web\Controllers\Controller;
use App\Http\Web\Requests\Products\StoreBusinessLineRequest;
use App\Http\Web\Requests\Products\UpdateBusinessLineRequest;
use App\Http\Web\Services\Products\BusinessLineService;
use App\Models\Products\BusinessLine;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class BusinessLineController extends Controller
{
    public function __construct(
        protected BusinessLineService $businessLineService,
    ) {}

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
    public function store(StoreBusinessLineRequest $request)
    {
        $this->businessLineService->create($request->validated());

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

    public function update(UpdateBusinessLineRequest $request, BusinessLine $businessLine)
    {
        $this->businessLineService->update($businessLine, $request->validated());

        return redirect()->route('products.business-lines.index')
            ->with('message', 'Línea de negocio actualizada con éxito');
    }
    public function destroy(BusinessLine $businessLine)
    {
        try {
            $this->businessLineService->delete($businessLine);
        } catch (ValidationException $e) {
            return back()->withErrors($e->errors());
        }

        return redirect()->route('products.business-lines.index')
            ->with('message', 'Línea de negocio eliminada correctamente');
    }
}
