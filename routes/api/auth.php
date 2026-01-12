<?php

use App\Http\Api\v1\Controllers\Customers\CustomerAuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {

    // Registro
    Route::post('register', [CustomerAuthController::class, 'register']);
    Route::post('login', [CustomerAuthController::class, 'login']);
     // 🔥 LOGIN CON GOOGLE
    Route::post('google', [CustomerAuthController::class, 'loginWithGoogle']);

    // Rutas protegidas por JWT (auth:api)
    Route::middleware('auth:api')->group(function () {
        Route::post('logout', [CustomerAuthController::class, 'logout']);
        Route::get('me', [CustomerAuthController::class, 'me']);
    });
});
