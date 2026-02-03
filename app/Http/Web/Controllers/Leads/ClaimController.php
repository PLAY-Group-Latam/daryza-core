<?php

namespace App\Http\Web\Controllers\Leads;

use App\Http\Web\Controllers\Controller;
use App\Models\Leads\Claim;
use App\Http\Web\Services\Leads\ClaimService;
use App\Http\Web\Requests\Leads\ClaimRequest;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class ClaimController extends Controller
{
    /**
     * LISTAR: Mostrar lista paginada de reclamaciones.
     */
    public function index()
    {
        $service = new ClaimService();
        
        return Inertia::render('leads/claims/Index', [
            'paginatedClaims' => $service->getPaginatedClaims(10)
        ]);
    }

    public function create()
    {
        return Inertia::render('leads/claims/Create');
    }

    /**
     * GUARDAR: Almacenar una nueva reclamación.
     */
    public function store(ClaimRequest $request)
    {
        $service = new ClaimService();
        
        $service->save($request->validated());

        return redirect()->route('claims.items.index')
            ->with('success', 'Reclamación enviada y registrada correctamente.');
    }

    public function show(Claim $claim)
    {
        $service = new ClaimService();

        return Inertia::render('leads/claims/Show', [
            'claim' => $service->getDetails($claim)
        ]);
    }

    public function edit(Claim $claim)
    {
        return Inertia::render('leads/claims/Edit', [
            'claim' => $claim
        ]);
    }

  
    public function update(ClaimRequest $request, Claim $claim)
    {
        
        $claim->update([
            'full_name' => $request->name,
            'email'     => $request->email,
            'phone'     => $request->phone_number,
            'status'    => $request->status ?? $claim->status,
        ]);

        return redirect()->route('claims.items.index')
            ->with('success', 'Reclamación actualizada exitosamente');
    }

    public function destroy(Claim $claim)
    {
       
        if ($claim->file_path) {
            Storage::disk('public')->delete($claim->file_path);
        }

        $claim->delete();

        return redirect()->route('claims.items.index')
            ->with('success', 'Reclamación eliminada exitosamente');
    }
}