<?php

use App\Http\Api\v1\Controllers\Products\ProductCategoryController;
use App\Http\Api\v1\Controllers\Products\ProductController;
use Illuminate\Support\Facades\Route;

Route::prefix('products')->group(function () {
  Route::get('/', [ProductController::class, 'index']);
  Route::get('categories', [ProductCategoryController::class, 'index']);
});
