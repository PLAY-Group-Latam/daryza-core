<?php

namespace App\Http\Web\Controllers\JobsPortal;

use App\Http\Web\Controllers\Controller;
use App\Http\Web\Services\JobsPortal\ApplicationService;
use App\Models\JobsPortal\Application;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ApplicationController extends Controller
{
    public function __construct(private readonly ApplicationService $service) {}

    public function index(Request $request): Response
    {
        $filters = $request->only(['email', 'job_id']);

        return Inertia::render('jobsPortal/applications/Index', [
            'paginatedApplications' => $this->service->paginate($filters, (int) $request->input('per_page', 10)),
            'filters' => $filters,
        ]);
    }

    public function show(Application $application): Response
    {
        return Inertia::render('jobsPortal/applications/Show', [
            'application' => $application->load('job.area', 'job.place'),
        ]);
    }

    public function destroy(Application $application): RedirectResponse
    {
        $this->service->delete($application);

        return redirect()->route('admin.jobs.applications.index')->with('success', 'Postulación eliminada correctamente.');
    }
}
