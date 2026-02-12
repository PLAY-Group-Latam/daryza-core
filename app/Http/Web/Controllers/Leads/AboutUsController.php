<?php

namespace App\Http\Web\Controllers\Leads;

use App\Http\Web\Controllers\Controller;
use App\Http\Web\Services\Leads\AboutService;
use App\Http\Web\Requests\Leads\WebAboutRequest; 
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class AboutUsController extends Controller
{
    protected $aboutService;

    /**
     * Inyección de dependencia del Servicio
     */
    public function __construct(AboutService $aboutService)
    {
        $this->aboutService = $aboutService;
    }

    /**
     * Muestra la lista paginada en el panel administrativo
     */
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'status']);
        
        // Obtenemos los leads filtrados exclusivamente por 'about_us'
        $aboutus = $this->aboutService->getPaginatedContacts($filters);

        return Inertia::render('leads/aboutus/Index', [
            'paginatedClaims' => $aboutus, // Mantenemos el nombre que pide tu Index.tsx
            'filters'         => $filters, 
        ]);
    }

    /**
     * Guarda el formulario desde la web pública
     */
    public function store(WebAboutRequest $request) 
    {
        // Validamos con las reglas que incluyen CellPhoneRule y DniRucRule
        $this->aboutService->save($request->validated());

        return back()->with('success', 'Tu solicitud de información ha sido enviada correctamente.');
    }
}