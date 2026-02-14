<?php

use App\Http\Api\v1\Controllers\Content\ContentApiController;
use Illuminate\Support\Facades\Route;


Route::prefix('content')->group(function () {
    

    Route::get('/{slug}/{type}/{id}', [ContentApiController::class, 'show']);
    

    Route::get('/page/{slug}', [ContentApiController::class, 'getPage']);
    
});