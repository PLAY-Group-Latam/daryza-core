<?php

use App\Http\Api\v1\Controllers\Blogs\BlogController;
use Illuminate\Support\Facades\Route;

Route::prefix('blogs')->group(function () {
  // Listar todos los blogs con paginación
  Route::get('/', [BlogController::class, 'index']);

  // Mostrar un blog específico por slug
  // Route::get('{slug}', [BlogController::class, 'show']);
});
