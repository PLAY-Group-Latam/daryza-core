<?php

use App\Http\Web\Controllers\Leads\ClaimController;
use App\Http\Web\Controllers\Leads\ContactController;
use Illuminate\Support\Facades\Route;

Route::prefix('claims')->name('claims.')->middleware('auth')->group(function () {
  Route::resource('items', ClaimController::class)
    ->names('items')
    ->parameters([
      'items' => 'claim',
    ]);
});

Route::prefix('contacts')->name('contacts.')->group(function () {
    Route::resource('items', ContactController::class)
        ->names('items')
        ->parameters([
            'items' => 'contact',
        ]);
});