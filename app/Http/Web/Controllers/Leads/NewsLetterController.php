<?php

namespace App\Http\Web\Controllers\Leads;

use App\Http\Web\Controllers\Controller;
use App\Http\Web\Services\Leads\NewsLetterService;
use App\Models\Leads\Lead;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NewsLetterController extends Controller
{
    public function __construct(
        protected NewsLetterService $newsLetterService
    ) {}

  
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'per_page']);
        
        $subscriptions = $this->newsLetterService->getPaginated($filters);

        return Inertia::render('leads/newsletter/Index', [
            'subscriptions' => $subscriptions,
            'filters'       => $filters,
        ]);
    }

    public function destroy(Lead $subscription)
    {
        $this->newsLetterService->delete($subscription);

        return redirect()->back()->with('success', 'Suscripción eliminada correctamente.');
    }
}