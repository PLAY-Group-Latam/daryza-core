<?php

namespace App\Http\Web\Controllers\Distributors;

use App\Http\Web\Controllers\Controller;
use App\Http\Web\Services\Distributors\DistributorsService;
use App\Http\Web\Resources\Distributors\DistributorsResource;
use App\Http\Web\Requests\Distributors\DistributorRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache; // Agregamos la fachada de Caché
use Inertia\Inertia;
use Inertia\Response;

class DistributorController extends Controller
{
    protected DistributorsService $service;

    public function __construct(DistributorsService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request): Response
    {
        $paginated = $this->service->getPaginated($request->all());

        // Quitamos la consulta manual de $mapPin
        return Inertia::render('distributors/Index', [
            'paginatedDistributors' => $paginated->through(fn ($item) => new DistributorsResource($item)),
            'filters'               => $request->only(['search']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('distributors/Create');
    }

    public function store(DistributorRequest $request): RedirectResponse
    {
        $this->service->store($request->validated());

        return redirect()->route('distributors.index')
            ->with('success', 'Distribuidor creado con éxito.');
    }

    public function show($id): Response
    {
        $distributor = $this->service->findById((int) $id);

        return Inertia::render('distributors/Show', [
            'distributor' => new DistributorsResource($distributor),
        ]);
    }

    public function edit($id): Response
    {
        $distributor = $this->service->findById((int) $id);

        return Inertia::render('distributors/Edit', [
            'distributor' => new DistributorsResource($distributor),
        ]);
    }

    public function update(DistributorRequest $request, $id): RedirectResponse
    {
        $this->service->update((int) $id, $request->validated());

        return redirect()->route('distributors.index')
            ->with('success', 'Distribuidor actualizado con éxito.');
    }

    public function destroy($id): RedirectResponse
    {
        $this->service->delete((int) $id);

        return redirect()->back()
            ->with('success', 'Distribuidor eliminado.');
    }

    public function updateMapPin(Request $request): RedirectResponse
    {
        $request->validate([
            'logo_pin' => ['required', 'image', 'mimes:png,svg,jpg,jpeg,webp', 'max:2048'],
        ]);

        $this->service->updateMapPin($request->file('logo_pin'));
        Cache::forget('global_map_pin');

        return redirect()->route('distributors.index')
            ->with('success', 'Pin del mapa actualizado correctamente.');
    }
}