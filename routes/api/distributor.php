<?php

use Illuminate\Support\Facades\Route;
use App\Http\Api\v1\Controllers\Distributors\DistributorController;


Route::prefix('distributors')->group(function () {
    Route::get('/', [DistributorController::class, 'index']);
    Route::get('/{id}', [DistributorController::class, 'show']);
});