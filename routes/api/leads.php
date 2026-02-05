<?php

use App\Http\Api\v1\Controllers\Leads\ClaimApiController;
use Illuminate\Support\Facades\Route;

Route::prefix('claims')->group(function () {
    Route::post('items', [ClaimApiController::class, 'store']);
});