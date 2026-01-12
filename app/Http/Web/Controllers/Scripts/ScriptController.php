<?php

namespace App\Http\Web\Controllers\Scripts;

use App\Http\Web\Controllers\Controller;
use App\Models\Script;
use App\Models\Scripts;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScriptController extends Controller
{
    /**
     * Lista de scripts (vista Inertia)
     */
    public function index(Request $request)
    {
        $perPage = $request->query('per_page', 10);

        $scripts = Script::orderBy('created_at', 'desc')
            ->paginate($perPage);

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
    /**
     * Guardar nuevo script
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'      => 'required|string|max:255',
            'placement' => 'required|in:head,body',
            'active'    => 'required|boolean',
            'content'   => 'required|string',
        ]);

        Script::create($data);

        return back()->with('success', 'Script creado correctamente');
    }

    /**
     * Actualizar script existente
     */
    public function update(Request $request, Script $script)
    {
        $data = $request->validate([
            'name'      => 'required|string|max:255',
            'placement' => 'required|in:head,body',
            'active'    => 'required|boolean',
            'content'   => 'required|string',
        ]);

        $script->update($data);

        return back()->with('success', 'Script actualizado correctamente');
    }

    /**
     * Eliminar script
     */
    public function destroy(Script $script)
    {
        $script->delete();

        return back()->with('success', 'Script eliminado correctamente');
    }
}

