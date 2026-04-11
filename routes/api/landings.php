<?php

use App\Http\Api\v1\Controllers\Landings\LandingLeadApiController;
use App\Http\Api\v1\Controllers\Content\LandingSectionsController;
use Illuminate\Support\Facades\Route;

Route::prefix('landings')->group(function () {
    Route::get('/sections', LandingSectionsController::class);
    Route::post('/{slug}/leads', [LandingLeadApiController::class, 'store']);
});
