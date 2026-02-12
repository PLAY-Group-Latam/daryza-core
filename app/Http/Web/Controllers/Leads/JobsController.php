<?php

namespace App\Http\Web\Controllers\Leads;

use App\Http\Web\Controllers\Controller;
use App\Models\Leads\Lead;
use App\Http\Web\Services\Leads\JobsService; 
use App\Http\Web\Requests\Leads\WebJobsRequest; 
use Inertia\Inertia;
use Illuminate\Http\Request;

class JobsController extends Controller
{
    protected $service;

    public function __construct(JobsService $service)
    {
        $this->service = $service;
    }

 public function index(Request $request) 
{
    $filters = $request->only(['search']);

    return Inertia::render('leads/jobs/Index', [
     
        'paginatedJobs' => $this->service->getPaginatedJobs($filters, 10),
        'filters' => $filters 
    ]);
}

    public function store(WebJobsRequest $request)
    {
    
        $this->service->save($request->validated());

        return redirect()->route('jobs.items.index')
            ->with('success', 'Postulación enviada correctamente.');
    }

    public function destroy(Lead $job)
    {
        $this->service->delete($job);

        return redirect()->route('jobs.items.index')
            ->with('success', 'Postulación eliminada exitosamente.');
    }
}