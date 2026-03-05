<?php

use App\Http\Api\v1\Controllers\Seo\SeoApiController;
use Illuminate\Support\Facades\Route;

Route::prefix('seos')->group(function () {
   
    Route::get('/getMetadata/{slug}', [SeoApiController::class, 'showByPage']);
});