<?php

use Illuminate\Support\Facades\Route;
use App\Http\Api\v1\Controllers\PayMethods\PayMethodApiController;


Route::prefix('paymethods')->group(function () {
    Route::get('/getpaymethods', [PayMethodApiController::class, 'index']);
});