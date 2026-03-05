<?php

use Illuminate\Support\Facades\Route;
use App\Http\Api\v1\Controllers\Settings\PayMethodApiController;


Route::prefix('paymethods')->group(function () {
    Route::get('/getpaymethods', [PayMethodApiController::class, 'index']);
});
