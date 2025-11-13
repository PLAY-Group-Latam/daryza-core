<?php

namespace App\Http\Web\Controllers;

use App\Http\web\Controllers\Controller;
use App\Http\Web\Requests\Users\StoreUserRequest;
use App\Http\Web\Requests\Users\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Trae todos los usuarios
        $users = User::all();

        // Retorna la vista de Inertia con los usuarios
        return Inertia::render('users/Index', [
            'users' => $users,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request)
    {
        $data = $request->validated();
        $data['password'] = bcrypt($data['password']);
        User::create($data);

        return back()->with('success', 'Usuario creado correctamente.');
    }


    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        $data = $request->validated();

        if (!empty($data['password'])) {
            $data['password'] = bcrypt($data['password']);
        } else {
            unset($data['password']);
        }
        // Verifica si hay cambios reales
        if (empty(array_diff_assoc($data, $user->only(array_keys($data))))) {
            return back()->with('info', 'No se realizaron cambios.');
        }
        $user->update($data);

        return back()->with('success', 'Usuario actualizado correctamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        // Si más adelante implementas roles con Spatie, puedes proteger al superadmin:
        // if ($user->hasRole('super-admin')) {
        //     return back()->with('error', 'No se puede eliminar al super administrador.');
        // }

        $user->delete();

        return back()->with('success', 'Usuario eliminado correctamente.');
    }
}
