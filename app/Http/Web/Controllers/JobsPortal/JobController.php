<?php

namespace App\Http\Web\Controllers\JobsPortal;

use App\Enums\JobModality;
use App\Http\Web\Controllers\Controller;
use App\Http\Web\DTO\JobsPortal\JobData;
use App\Http\Web\Requests\JobsPortal\StoreJobRequest;
use App\Http\Web\Requests\JobsPortal\UpdateJobRequest;
use App\Http\Web\Services\JobsPortal\JobService;
use App\Models\JobsPortal\Area;
use App\Models\JobsPortal\Job;
use App\Models\JobsPortal\Place;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JobController extends Controller
{
    public function __construct(private readonly JobService $service)
    {
    }

    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'area_id', 'place_id', 'modality', 'is_active']);

        return Inertia::render('jobsPortal/offers/Index', [
            'paginatedOffers' => $this->service->paginate($filters, (int) $request->input('per_page', 10)),
            'filters' => $filters,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('jobsPortal/offers/Create', [
            'departments' => Area::query()->orderBy('name')->get(['id', 'name']),
            'places' => Place::query()
                ->with('areas:id')
                ->orderBy('name')
                ->get(['id', 'name', 'city'])
                ->map(fn (Place $place) => [
                    'id' => $place->id,
                    'name' => $place->name,
                    'city' => $place->city,
                    'area_ids' => $place->areas->pluck('id')->values(),
                ]),
            'modalities' => array_map(fn (JobModality $modality) => $modality->value, JobModality::cases()),
        ]);
    }

    public function store(StoreJobRequest $request): RedirectResponse
    {
        $this->service->create(JobData::fromArray($request->validated()));

        return redirect()->route('admin.jobs.offers.index')->with('success', 'Oferta creada correctamente.');
    }

    public function edit(Job $job): Response
    {
        return Inertia::render('jobsPortal/offers/Edit', [
            'offer' => $job->load('metadata'),
            'departments' => Area::query()->orderBy('name')->get(['id', 'name']),
            'places' => Place::query()
                ->with('areas:id')
                ->orderBy('name')
                ->get(['id', 'name', 'city'])
                ->map(fn (Place $place) => [
                    'id' => $place->id,
                    'name' => $place->name,
                    'city' => $place->city,
                    'area_ids' => $place->areas->pluck('id')->values(),
                ]),
            'modalities' => array_map(fn (JobModality $modality) => $modality->value, JobModality::cases()),
        ]);
    }

    public function update(UpdateJobRequest $request, Job $job): RedirectResponse
    {
        $this->service->update($job, JobData::fromArray($request->validated()));

        return redirect()->route('admin.jobs.offers.index')->with('success', 'Oferta actualizada correctamente.');
    }

    public function destroy(Job $job): RedirectResponse
    {
        $this->service->delete($job);

        return redirect()->route('admin.jobs.offers.index')->with('success', 'Oferta eliminada correctamente.');
    }
}
