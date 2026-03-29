<?php

use App\Http\Api\v1\Controllers\Coupons\CouponController;
use Illuminate\Support\Facades\Route;

Route::prefix('coupons')->group(function () {
    Route::get('/', [CouponController::class, 'index']);

    Route::middleware('auth:api')->group(function () {
        Route::post('/validate', [CouponController::class, 'validateCoupon']);
    });
});
