<?php

namespace App\Http\Web\Controllers\JobsPortal;

use App\Http\Web\Controllers\Controller;
use App\Http\Web\DTO\JobsPortal\PlaceData;
use App\Http\Web\Requests\JobsPortal\StorePlaceRequest;
use App\Http\Web\Requests\JobsPortal\UpdatePlaceRequest;
use App\Http\Web\Services\JobsPortal\PlaceService;
use App\Models\JobsPortal\Area;
use App\Models\JobsPortal\Place;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlaceController extends Controller
{
    public function __construct(private readonly PlaceService $service)
    {
    }

    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'is_active']);

        return Inertia::render('jobsPortal/places/Index', [
            'paginatedPlaces' => $this->service->paginate($filters, (int) $request->input('per_page', 10)),
            'filters' => $filters,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('jobsPortal/places/Create', [
            'areas' => Area::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StorePlaceRequest $request): RedirectResponse
    {
        $this->service->create(PlaceData::fromArray($request->validated()));

        return redirect()->route('admin.jobs.places.index')->with('success', 'Sede creada correctamente.');
    }

    public function edit(Place $place): Response
    {
        return Inertia::render('jobsPortal/places/Edit', [
            'place' => [
                ...$place->toArray(),
                'area_ids' => $place->areas()->pluck('areas.id')->values(),
            ],
            'areas' => Area::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(UpdatePlaceRequest $request, Place $place): RedirectResponse
    {
        $this->service->update($place, PlaceData::fromArray($request->validated()));

        return redirect()->route('admin.jobs.places.index')->with('success', 'Sede actualizada correctamente.');
    }

    public function destroy(Place $place): RedirectResponse
    {
        $this->service->delete($place);

        return redirect()->route('admin.jobs.places.index')->with('success', 'Sede eliminada correctamente.');
    }
}
