<?php

use App\Http\Api\v1\Controllers\Coupons\CouponController;
use Illuminate\Support\Facades\Route;

Route::prefix('coupons')->middleware('auth:api')->group(function () {
    Route::post('/validate', [CouponController::class, 'validateCoupon']);
});
