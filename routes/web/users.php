<?php

use App\Http\Web\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
  Route::resource('usuarios', UserController::class)
    ->names('users')
    ->parameters([
      'usuarios' => 'user',
    ]);
});
