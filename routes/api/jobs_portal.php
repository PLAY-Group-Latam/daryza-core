<?php

use App\Http\Api\v1\Controllers\JobsPortal\JobsPortalApiController;
use Illuminate\Support\Facades\Route;

Route::prefix('jobs-portal')->group(function () {
    Route::get('filters', [JobsPortalApiController::class, 'filters']);
    Route::get('areas', [JobsPortalApiController::class, 'areas']);
    Route::get('areas/{areaId}/places', [JobsPortalApiController::class, 'areaPlaces']);
    Route::get('areas/{areaId}/offers', [JobsPortalApiController::class, 'areaOffers']);
    Route::get('areas/{areaId}/places/{placeId}/offers', [JobsPortalApiController::class, 'areaPlaceOffers']);
    Route::get('offers', [JobsPortalApiController::class, 'offers']);
    Route::get('offers/{slug}', [JobsPortalApiController::class, 'offerDetail']);
    Route::post('applications', [JobsPortalApiController::class, 'apply']);
});
