<?php

use Illuminate\Support\Facades\Route;

Route::prefix('v1')
  ->middleware('api')
  ->group(function () {
    require __DIR__ . '/auth.php';
    require __DIR__ . '/ubigeos.php';
    require __DIR__ . '/customer.php';
    require __DIR__ . '/orders.php';
    require __DIR__ . '/products.php';
    require __DIR__ . '/leads.php';
    require __DIR__ . '/blogs.php';
    require __DIR__ . '/jobs_portal.php';
    require __DIR__ . '/content.php';
    require __DIR__ . '/paymethods.php';
    require __DIR__ . '/seo.php';
    require __DIR__ . '/wishlist.php';
    require __DIR__ . '/notification.php';
  });

Route::prefix('v1')
  ->group(function () {
    require __DIR__ . '/script.php';
    require __DIR__ . '/niubiz.php';
  });
