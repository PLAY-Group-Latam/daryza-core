<?php

use App\Http\Api\v1\Controllers\Customers\CustomerAddressController;
use App\Http\Api\v1\Controllers\Customers\CustomerController;
use Illuminate\Support\Facades\Route;

Route::prefix('customers')->middleware('auth:api')->group(function () {
  Route::post('{customer}/addresses', [CustomerAddressController::class, 'store']);
  Route::get('{customer}/addresses', [CustomerAddressController::class, 'index']);
      Route::put('me', [CustomerController::class, 'update']);

});
