<?php

use App\Http\Web\Controllers\Products\AttributeController;
use App\Http\Web\Controllers\Products\ProductCategoryController;
use App\Http\Web\Controllers\Products\ProductController;
use Illuminate\Support\Facades\Route;

Route::prefix('productos')->name('products.')->middleware('auth')->group(function () {
  Route::resource('categorias', ProductCategoryController::class)
    ->names('categories')
    ->parameters([
      'categorias' => 'categories',
    ]);

  Route::resource('items', ProductController::class);
  Route::resource('attributes', AttributeController::class);
});
