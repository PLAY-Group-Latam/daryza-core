<?php

namespace App\Http\Web\Controllers;

use App\Http\Web\Requests\Users\StoreUserRequest;
use App\Http\Web\Requests\Users\UpdateUserRequest;
use App\Http\Web\Services\UserService;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class UserController extends Controller
{
    public function __construct(protected UserService $userService) {}

   public function index()
{
    $perPage = request()->input('per_page', 10);
    $search = request()->input('search');

    $paginatedUsers = User::query()
        ->when($search, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('email', 'ilike', "%{$search}%");
            });
        })
        ->orderBy('id', 'desc')
        ->paginate($perPage)
        ->withQueryString();

    return Inertia::render('users/Index', [
        'paginatedUsers' => $paginatedUsers,
        'filters' => ['search' => $search], 
    ]);
}
    public function store(StoreUserRequest $request): RedirectResponse
    {
        $this->userService->create($request->validated());
        return back()->with('flash', [
            'type' => 'success',
            'message' => 'Usuario creado correctamente.',
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $this->userService->update($user, $request->validated());

        return back()->with('flash', [
            'type' => 'success',
            'message' => 'Usuario actualizado correctamente.',
        ]);
    }

    public function destroy(User $user)
    {
        try {
            $this->userService->delete($user);

            return back()->with('flash', [
                'type' => 'success',
                'message' => 'Usuario eliminado correctamente.',
            ]);
        } catch (\Exception $e) {
            return back()->with('flash', [
                'type' => 'error',
                'message' => $e->getMessage(),
            ]);
        }
    }
}
