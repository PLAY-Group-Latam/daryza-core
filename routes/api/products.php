<?php

use App\Http\Api\v1\Controllers\Products\ProductCategoryController;
use App\Http\Api\v1\Controllers\Products\ProductController;
use App\Http\Api\v1\Controllers\Products\ProductFilterController;
use App\Http\Api\v1\Controllers\Products\ProductSearchController;
use App\Http\Api\v1\Controllers\Products\BrandController;
use App\Http\Api\v1\Controllers\Products\BusinessLineController;
use Illuminate\Support\Facades\Route;

Route::prefix('products')->group(function () {
  Route::get('home', [ProductController::class, 'home']); // <--- NUEVA RUTA
  Route::get('home-packs', [ProductController::class, 'homePacks']);
  Route::get('filter', [ProductFilterController::class, 'index']);
  Route::get('search/suggest', [ProductSearchController::class, 'suggest']);
  Route::get('business-lines', [BusinessLineController::class, 'index']);
  Route::get('brands', [BrandController::class, 'index']);
  Route::get('packs/{slug}', [ProductController::class, 'showPack']);
  Route::get('categories', [ProductCategoryController::class, 'index']);
  Route::get('/', [ProductController::class, 'index']);
  Route::get('{slug}', [ProductController::class, 'show']); // ← al final
});
