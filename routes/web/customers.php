<?php

use App\Http\Web\Controllers\CustomerController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
  Route::get('clientes/export', [CustomerController::class, 'export'])
    ->name('customers.export');

  Route::resource('clientes', CustomerController::class)
    ->names('customers')
    ->parameters([
      'clientes' => 'customer',
    ]);

  Route::put(
    'clientes/{customer}/password',
    [CustomerController::class, 'updatePassword']
  )->name('customers.password.update');
});
