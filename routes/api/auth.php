<?php

use App\Http\Api\v1\Controllers\CustomerAuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {

  // Registro
  Route::post('register', [CustomerAuthController::class, 'register']);
  Route::post('login', [CustomerAuthController::class, 'login']);
   // Rutas protegidas por JWT (auth:api)
    Route::middleware('auth:api')->group(function () {
        Route::post('logout', [CustomerAuthController::class, 'logout']);

        // // Ejemplo: obtener perfil del cliente
        // Route::get('profile', function () {
        //     return auth('api')->user();
        // });

        // Aquí puedes agregar más rutas protegidas
        // Route::get('orders', [OrderController::class, 'index']);
        // Route::post('update', [CustomerController::class, 'update']);
    });

});
