<?php

use App\Http\Web\Controllers\Landings\LandingController;
use Illuminate\Support\Facades\Route;

Route::prefix('landings')->name('landings.')->middleware('auth')->group(function () {
    Route::get('items/{landing}/leads', [LandingController::class, 'leads'])->name('items.leads');

    Route::resource('items', LandingController::class)
        ->except(['show'])
        ->names('items')
        ->parameters([
            'items' => 'landing',
        ]);
});
