<?php

namespace App\Http\Web\Controllers\Leads;

use App\Http\Web\Controllers\Controller;
use App\Models\Leads\Lead;
use App\Http\Web\Services\Leads\ClaimService;
use App\Http\Web\Requests\Leads\ClaimRequest;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ClaimController extends Controller
{
    protected $service;

    public function __construct(ClaimService $service)
    {
        $this->service = $service;
    }

    public function index(Request $request) 
    {
        $search = $request->input('search');

        return Inertia::render('leads/claims/Index', [
            'paginatedClaims' => $this->service->getPaginatedClaims(10, $search),
            'filters' => $request->only(['search']) 
        ]);
    }

    public function store(ClaimRequest $request)
    {
       
        $this->service->save($request->validated());

        return redirect()->route('claims.items.index')
            ->with('success', 'Reclamación enviada correctamente.');
    }

    public function update(ClaimRequest $request, Lead $claim)
    {
       
        $this->service->update($claim, $request->validated());

        return redirect()->route('claims.items.index')
            ->with('success', 'Reclamación actualizada exitosamente');
    }

    public function destroy(Lead $claim)
    {
        
        $this->service->delete($claim);

        return redirect()->route('claims.items.index')
            ->with('success', 'Reclamación eliminada exitosamente');
    }
}