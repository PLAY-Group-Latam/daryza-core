<?php

use Illuminate\Support\Facades\Route;

Route::prefix('v1')
  ->middleware('api')
  ->group(function () {
    require __DIR__ . '/auth.php';
    require __DIR__ . '/ubigeos.php';
    require __DIR__ . '/customer.php';
    require __DIR__ . '/products.php';
  });
