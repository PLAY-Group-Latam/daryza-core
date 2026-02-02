<?php

use App\Http\Web\Controllers\Leads\ClaimControler;
use Illuminate\Support\Facades\Route;

Route::prefix('reclamaciones')->name('reclamaciones.')->middleware('auth')->group(function () {
  Route::resource('items', ClaimControler::class)
    ->names('items')
    ->parameters([
      'items' => 'claim',
    ]);
});