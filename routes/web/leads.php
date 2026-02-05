<?php

use App\Http\Web\Controllers\Leads\ClaimController;
use Illuminate\Support\Facades\Route;

Route::prefix('claims')->name('claims.')->middleware('auth')->group(function () {
  Route::resource('items', ClaimController::class)
    ->names('items')
    ->parameters([
      'items' => 'claim',
    ]);
});