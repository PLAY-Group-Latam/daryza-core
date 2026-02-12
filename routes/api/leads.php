<?php

use App\Http\Api\v1\Controllers\Leads\ClaimApiController;
use App\Http\Api\v1\Controllers\Leads\ContactApiController;
use App\Http\Api\v1\Controllers\Leads\AboutUsApiController;
use App\Http\Api\v1\Controllers\Leads\JobsApiController;
use Illuminate\Support\Facades\Route;

Route::prefix('claims')->group(function () {
    Route::post('items', [ClaimApiController::class, 'store']);
});

Route::prefix('contacts')->group(function () {
    Route::post('items', [ContactApiController::class, 'store']);
});

Route::prefix('about-us')->group(function (){
    Route::post('items',[AboutUsApiController::class, 'store']);
});

Route::prefix('jobs')->group(function (){
    Route::post('items',[JobsApiController::class, 'store']);
});