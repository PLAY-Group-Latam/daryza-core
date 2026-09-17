<?php

namespace App\Http\Web\Controllers\Settings;

use App\Http\Web\Controllers\Controller;
use App\Http\Web\Requests\Settings\DestinationEmailRequest;
use App\Http\Web\Services\Settings\DestinationEmailService;
use App\Models\Settings\DestinationEmail;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DestinationEmailController extends Controller
{
    public function __construct(protected DestinationEmailService $service) {}

public function index(Request $request)
{
    $perPage = (int) $request->query('per_page', 10);
    $search = $request->query('search');

    $paginated = $this->service->paginate($perPage, $search);


    return Inertia::render('destination-emails/content-list', [
        'paginatedDestinationEmails' => $paginated,
        'filters' => ['search' => $search],
        'pageOptions' => $this->pageOptions(),
    ]);
}

    public function create()
    {
        return Inertia::render('destination-emails/createDestinationEmail', [
            'pageOptions' => $this->pageOptions(),
        ]);
    }

    public function store(DestinationEmailRequest $request)
    {
        $this->service->store($request->validated());

        return redirect()->route('destination-emails.index')
            ->with('success', 'Email de destino creado correctamente');
    }

    public function edit(DestinationEmail $destinationEmail)
    {
        return Inertia::render('destination-emails/editDestinationEmail', [
            'destinationEmail' => $destinationEmail,
            'pageOptions' => $this->pageOptions(),
        ]);
    }

    public function update(DestinationEmailRequest $request, DestinationEmail $destinationEmail)
    {
        $this->service->update($destinationEmail, $request->validated());

        return redirect()->route('destination-emails.index')
            ->with('success', 'Email de destino actualizado correctamente');
    }

    public function destroy(DestinationEmail $destinationEmail)
    {
        $this->service->destroy($destinationEmail);

        return back()->with('success', 'Email de destino eliminado correctamente');
    }

    public function toggle(DestinationEmail $destinationEmail)
    {
        $this->service->toggle($destinationEmail);

        return back()->with('success', 'Estado del email de destino actualizado correctamente');
    }

    private function pageOptions(): array
    {
        return collect(config('emails.destination_emails.pages', []))
            ->map(fn (array $page, string $key) => [
                'key' => $key,
                'label' => $page['label'] ?? $key,
                'fallback_env' => $page['fallback_env'] ?? null,
            ])
            ->values()
            ->all();
    }
}
