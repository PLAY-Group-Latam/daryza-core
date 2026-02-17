<?php

namespace App\Http\Web\Controllers\Leads;

use App\Http\Web\Controllers\Controller;
use App\Http\Web\Services\Leads\ContactService;
use App\Http\Web\Requests\Leads\WebContactRequest; 
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\JsonResponse;

class ContactController extends Controller
{
    protected $contactService;

    public function __construct(ContactService $contactService)
    {
        $this->contactService = $contactService;
    }

    
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'type', 'status']);
        
        if (!isset($filters['type'])) {
            $filters['type'] = 'help_center';
        }

        $contacts = $this->contactService->getPaginatedContacts($filters);

        return Inertia::render('leads/contacts/Index', [
            'paginatedContacts' => $contacts,
            'filters' => $filters, 
        ]);
    }

   
    public function store(WebContactRequest $request) 
    {
       
        $this->contactService->save($request->validated());

        return back()->with('success', 'Formulario enviado con éxito.');
    }

    
    public function show(string $id): JsonResponse
    {
        $contact = $this->contactService->getDetails($id);
        
        return response()->json($contact);
    }
}