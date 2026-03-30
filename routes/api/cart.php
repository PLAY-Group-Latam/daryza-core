<?php

use App\Http\Api\v1\Controllers\Customers\Cart\CartController;
use Illuminate\Support\Facades\Route;

Route::prefix('cart')->middleware('auth:api')->group(function () {
    Route::get('/', [CartController::class, 'index']);
    Route::get('/count', [CartController::class, 'count']);
    Route::post('/items', [CartController::class, 'add']);
    Route::patch('/items/{cartItem}', [CartController::class, 'updateQuantity']);
    Route::delete('/items/{cartItem}', [CartController::class, 'remove']);
    Route::delete('/clear', [CartController::class, 'clear']);
});

