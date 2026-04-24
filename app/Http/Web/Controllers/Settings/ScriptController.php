<?php

namespace App\Http\Web\Controllers\Settings;

use App\Http\Web\Controllers\Controller;
use App\Http\Web\Services\Settings\ScriptService;
use Illuminate\Http\Request;
use App\Models\Settings\Script;
use Inertia\Inertia;

class ScriptController extends Controller
{
    public function __construct(protected ScriptService $service) {}

    public function index(Request $request)
    {
        $scripts = $this->service->paginate($request->query('per_page', 10));

        return Inertia::render('scripts/content-list', [
            'scripts' => $scripts->items(),
            'meta' => [
                'current_page' => $scripts->currentPage(),
                'last_page'    => $scripts->lastPage(),
                'per_page'     => $scripts->perPage(),
                'total'        => $scripts->total(),
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('scripts/createScript');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'      => 'required|string|max:255',
            'placement' => 'required|in:head,body',
            'consent_type' => 'required|in:necessary,analytics,marketing',
            'active'    => 'required|boolean',
            'content'   => 'required|string',
        ]);

        $this->service->store($data);

        return redirect()->route('scripts.index')
            ->with('success', 'Script creado correctamente');
    }
    public function edit(Script $script)
{
    return inertia('scripts/editScript', [
        'script' => $script
    ]);
}

  public function update(Request $request, Script $script)
{
    $data = $request->validate([
        'name'      => 'required|string|max:255',
        'placement' => 'required|in:head,body',
        'consent_type' => 'required|in:necessary,analytics,marketing',
        'active'    => 'required|boolean',
        'content'   => 'required|string',
    ]);

    $this->service->update($script, $data);

  
    return redirect()->route('scripts.index')
        ->with('success', 'Script actualizado correctamente');
}

    public function destroy(Script $script)
    {
        $this->service->destroy($script);

        return back()->with('success', 'Script eliminado correctamente');
    }
}
