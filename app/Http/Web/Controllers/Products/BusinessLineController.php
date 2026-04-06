<?php

namespace App\Http\Web\Controllers\Products;

use App\Http\Web\Controllers\Controller;
use App\Http\Web\Requests\Products\StoreBusinessLineRequest;
use App\Http\Web\Requests\Products\UpdateBusinessLineRequest;
use App\Http\Web\Services\Products\BusinessLineService;
use App\Models\Products\BusinessLine;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class BusinessLineController extends Controller
{
    public function __construct(
        protected BusinessLineService $businessLineService,
    ) {}

    public function index(): Response
    {
        $perPage = request()->integer('per_page', 10);

        $businessLines = BusinessLine::latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('products/businessLines/Index', [
            'paginatedBusinessLines' => $businessLines,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('products/businessLines/Create');
    }

    public function store(StoreBusinessLineRequest $request): RedirectResponse
    {
        $this->businessLineService->create($request->validated());

        return redirect()
            ->route('products.business-lines.index')
            ->with('success', 'Línea de negocio creada con éxito');
    }

    public function edit(BusinessLine $businessLine): Response
    {
        return Inertia::render('products/businessLines/Edit', [
            'businessLine' => $businessLine,
        ]);
    }

    public function update(UpdateBusinessLineRequest $request, BusinessLine $businessLine): RedirectResponse
    {
        $this->businessLineService->update($businessLine, $request->validated());

        return redirect()
            ->route('products.business-lines.index')
            ->with('success', 'Línea de negocio actualizada con éxito');
    }

    public function destroy(BusinessLine $businessLine): RedirectResponse
    {
        try {
            $this->businessLineService->delete($businessLine);

            return redirect()
                ->route('products.business-lines.index')
                ->with('success', 'Línea de negocio eliminada correctamente');

        } catch (ValidationException $e) {
            return back()->withErrors($e->errors());
        }
    }
}