<?php

use App\Http\Web\Controllers\Leads\ClaimController;
use App\Http\Web\Controllers\Leads\ContactController;
use App\Http\Web\Controllers\Leads\AboutUsController;
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

Route::prefix('aboutus')->name('aboutus.')->group(function () {
    Route::resource('items', AboutUsController::class)
        ->names('items')
        ->parameters([
            'items' => 'aboutus',
        ]);
});