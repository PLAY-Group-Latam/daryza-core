<?php

namespace App\Http\Web\Controllers\JobsPortal;

use App\Http\Web\Controllers\Controller;
use App\Http\Web\DTO\JobsPortal\AreaData;
use App\Http\Web\Requests\JobsPortal\StoreAreaRequest;
use App\Http\Web\Requests\JobsPortal\UpdateAreaRequest;
use App\Http\Web\Services\JobsPortal\AreaService;
use App\Models\JobsPortal\Area;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AreaController extends Controller
{
    public function __construct(private readonly AreaService $service)
    {
    }

    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'is_active']);

        return Inertia::render('jobsPortal/departments/Index', [
            'paginatedDepartments' => $this->service->paginate($filters, (int) $request->input('per_page', 10)),
            'filters' => $filters,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('jobsPortal/departments/Create');
    }

    public function store(StoreAreaRequest $request): RedirectResponse
    {
        $this->service->create(AreaData::fromArray($request->validated()));

        return redirect()->route('admin.jobs.departments.index')->with('success', 'Área creada correctamente.');
    }

    public function edit(Area $area): Response
    {
        return Inertia::render('jobsPortal/departments/Edit', [
            'department' => $area,
        ]);
    }

    public function update(UpdateAreaRequest $request, Area $area): RedirectResponse
    {
        $this->service->update($area, AreaData::fromArray($request->validated()));

        return redirect()->route('admin.jobs.departments.index')->with('success', 'Área actualizada correctamente.');
    }

    public function destroy(Area $area): RedirectResponse
    {
        $this->service->delete($area);

        return redirect()->route('admin.jobs.departments.index')->with('success', 'Área eliminada correctamente.');
    }
}
