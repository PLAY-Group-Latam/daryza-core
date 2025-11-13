<?php

namespace App\Http\Web\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserService
{
  public function create(array $data): User
  {
    $data['password'] = Hash::make($data['password']);
    return User::create($data);
  }

  public function update(User $user, array $data): User
  {
    if (!empty($data['password'])) {
      $data['password'] = Hash::make($data['password']);
    } else {
      unset($data['password']);
    }

    if (empty(array_diff_assoc($data, $user->only(array_keys($data))))) {
      return $user;
    }

    $user->update($data);
    return $user;
  }

  public function delete(User $user): bool
  {
    if ($user->isSuperAdmin()) {
      throw new \Exception('No se puede eliminar al super administrador.');
    }

    return $user->delete();
  }
}
