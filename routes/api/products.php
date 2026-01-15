<?php

use App\Http\Api\v1\Controllers\Products\ProductCategoryController;
use Illuminate\Support\Facades\Route;

  Route::prefix('products')->group(function () {
        Route::get('categories', [ProductCategoryController::class, 'index']);
    });