<?php

use App\Http\Api\v1\Controllers\CustomerAuthController;
use Illuminate\Support\Facades\Route;


Route::prefix('auth')->group(function () {

  // Registro
  Route::post('register', [CustomerAuthController::class, 'register']);
  Route::post('login', [CustomerAuthController::class, 'login']);

  // // Login
  // Route::post('login', [CustomerAuthController::class, 'login']);

  // // Rutas protegidas por Sanctum
  // Route::middleware('auth:sanctum')->group(function () {

  //     Route::get('me', [CustomerProfileController::class, 'me']);

  //     Route::put('me', [CustomerProfileController::class, 'update']);

  //     Route::post('logout', [CustomerAuthController::class, 'logout']);
  // });
});
