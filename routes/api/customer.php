<?php

use App\Http\Api\v1\Controllers\CustomerAuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('customers')->middleware('auth:api')->group(function () {
  Route::post('{customer}/addresses', [CustomerAuthController::class, 'storeAddress']);
  Route::get('{customer}/addresses', [CustomerAuthController::class, 'getAddresses']);
});
