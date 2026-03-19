<?php

use App\Http\Api\v1\Controllers\Products\ProductCategoryController;
use App\Http\Api\v1\Controllers\Products\ProductController;
use App\Http\Api\v1\Controllers\Products\ProductFilterController;
use Illuminate\Support\Facades\Route;

Route::prefix('products')->group(function () {
  Route::get('home', [ProductController::class, 'home']); // <--- NUEVA RUTA
  Route::get('home-packs', [ProductController::class, 'homePacks']);
  Route::get('filter', [ProductFilterController::class, 'index']);
  Route::get('packs/{slug}', [ProductController::class, 'showPack']);
  Route::get('categories', [ProductCategoryController::class, 'index']);
  Route::get('/', [ProductController::class, 'index']);
  Route::get('{slug}', [ProductController::class, 'show']); // ← al final
});
