<?php

namespace App\Http\Web\Controllers\Landings;

use App\Http\Web\Controllers\Controller;
use App\Http\Web\Requests\Landings\StoreLandingRequest;
use App\Http\Web\Requests\Landings\UpdateLandingRequest;
use App\Http\Web\Services\Landings\LandingService;
use App\Models\Landings\Landing;
use App\Models\Metadata;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    public function __construct(
        protected LandingService $landingService
    ) {}

    public function index(Request $request): Response
    {
        $perPage = (int) $request->input('per_page', 10);

        return Inertia::render('landings/Index', [
            'paginatedLandings' => $this->landingService->getPaginated($perPage),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('landings/Create');
    }

    public function store(StoreLandingRequest $request): RedirectResponse
    {
        $this->landingService->save($request->validated());

        return redirect()
            ->route('landings.items.index')
            ->with('success', 'Landing creada correctamente.');
    }

    public function edit(Landing $landing): Response
    {
        $metadata = Metadata::query()
            ->where('metadatable_type', Landing::class)
            ->where('metadatable_id', (string) $landing->id)
            ->first();

        $landing->setRelation('metadata', $metadata);

        return Inertia::render('landings/Edit', [
            'landing' => $landing,
        ]);
    }

    public function update(UpdateLandingRequest $request, Landing $landing): RedirectResponse
    {
        $this->landingService->save($request->validated(), $landing);

        return redirect()
            ->route('landings.items.index')
            ->with('success', 'Landing actualizada correctamente.');
    }

    public function destroy(Landing $landing): RedirectResponse
    {
        $landing->delete();

        return redirect()
            ->route('landings.items.index')
            ->with('success', 'Landing eliminada correctamente.');
    }

    public function leads(Request $request, Landing $landing): Response
    {
        $perPage = (int) $request->input('per_page', 20);

        return Inertia::render('landings/Leads', [
            'landing' => $landing,
            'paginatedLeads' => $this->landingService->getLeadsByLanding($landing->id, $perPage),
        ]);
    }
}
