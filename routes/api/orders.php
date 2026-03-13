<?php

use App\Http\Api\v1\Controllers\Orders\OrderController;
use Illuminate\Support\Facades\Route;

Route::prefix('orders')->middleware('auth:api')->group(function () {
    Route::post('validate_order', [OrderController::class, 'validateOrder']);
    Route::get('/', [OrderController::class, 'index']);
    Route::post('/', [OrderController::class, 'store']);
    Route::get('{order}', [OrderController::class, 'show']);
    Route::post('{order}/cancel', [OrderController::class, 'cancel']);
    Route::post('{order}/payment-proof', [OrderController::class, 'uploadPaymentProof']);
    Route::post('{order}/niubiz/confirm', [OrderController::class, 'confirmNiubiz']);
});
