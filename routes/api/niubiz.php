<?php

use App\Http\Api\v1\Controllers\Payments\PaymentController;
use Illuminate\Support\Facades\Route;

Route::prefix('niubiz')->middleware('auth:api')->group(function () {
    Route::post('session', [PaymentController::class, 'createSession']);
    Route::post('confirm', [PaymentController::class, 'confirmPayment']);
});
