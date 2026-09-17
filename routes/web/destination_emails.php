<?php

use App\Http\Web\Controllers\Settings\DestinationEmailController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::prefix('destination-emails')->name('destination-emails.')->group(function () {
        Route::patch('/{destinationEmail}/toggle', [DestinationEmailController::class, 'toggle'])->name('toggle');
        Route::get('/', [DestinationEmailController::class, 'index'])->name('index');
        Route::get('/create', [DestinationEmailController::class, 'create'])->name('create');
        Route::post('/', [DestinationEmailController::class, 'store'])->name('store');
        Route::get('/{destinationEmail}/edit', [DestinationEmailController::class, 'edit'])->name('edit');
        Route::put('/{destinationEmail}', [DestinationEmailController::class, 'update'])->name('update');
        Route::delete('/{destinationEmail}', [DestinationEmailController::class, 'destroy'])->name('destroy');
    });
});
