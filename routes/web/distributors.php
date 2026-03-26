<?php

use App\Http\Web\Controllers\Distributors\DistributorController;
use Illuminate\Support\Facades\Route;

Route::prefix('distributors')->name('distributors.')->group(function () {

    Route::get('/', [DistributorController::class, 'index'])
        ->name('index');
    Route::get('/create', [DistributorController::class, 'create'])
        ->name('create');

    Route::post('/', [DistributorController::class, 'store'])
        ->name('store');

    Route::get('/{distributor}', [DistributorController::class, 'show'])
        ->name('show');

    Route::get('/{distributor}/edit', [DistributorController::class, 'edit'])
        ->name('edit');

    Route::put('/{distributor}', [DistributorController::class, 'update'])
        ->name('update');

    Route::delete('/{distributor}', [DistributorController::class, 'destroy'])
        ->name('destroy');
});