<?php

use App\Http\Api\v1\Controllers\Customers\CustomerAuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {

    // Registro / login (throttle contra fuerza bruta)
    Route::middleware('throttle:10,1')->group(function () {
        Route::post('register', [CustomerAuthController::class, 'register']);
        Route::post('login', [CustomerAuthController::class, 'login']);
        // 🔥 LOGIN CON GOOGLE
        Route::post('google', [CustomerAuthController::class, 'loginWithGoogle']);
    });

    // Recuperación de contraseña
    Route::middleware('throttle:5,1')->group(function () {
        Route::post('/forgot-password', [CustomerAuthController::class, 'forgotPassword']);
        Route::post('/reset-password',  [CustomerAuthController::class, 'resetPassword']);
    });

    Route::post('refresh', [CustomerAuthController::class, 'refresh'])->middleware('throttle:30,1');

    // Logout siempre disponible: debe limpiar la cookie aunque el token esté expirado.
    Route::post('logout', [CustomerAuthController::class, 'logout']);

    // Rutas protegidas por JWT (auth:api)
    Route::middleware('auth:api')->group(function () {
        Route::get('me', [CustomerAuthController::class, 'me']);
    });
});
