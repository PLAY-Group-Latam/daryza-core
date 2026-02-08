<?php

use App\Http\Api\v1\Controllers\Leads\ClaimApiController;
use App\Http\Api\v1\Controllers\Leads\ContactApiController;
use Illuminate\Support\Facades\Route;

Route::prefix('claims')->group(function () {
    Route::post('items', [ClaimApiController::class, 'store']);
});

Route::prefix('contacts')->group(function () {
    Route::post('items', [ContactApiController::class, 'store']);
});
