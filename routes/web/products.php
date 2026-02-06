<?php

use App\Http\Web\Controllers\Products\AttributeController;
use App\Http\Web\Controllers\Products\ProductCategoryController;
use App\Http\Web\Controllers\Products\ProductController;
use App\Http\Web\Controllers\Products\ProductExcelController;
use Illuminate\Support\Facades\Route;

Route::prefix('productos')->name('products.')->middleware('auth')->group(function () {
  Route::resource('categorias', ProductCategoryController::class)
    ->names('categories')
    ->parameters([
      'categorias' => 'categories',
    ]);

  Route::get('items/import', [ProductExcelController::class, 'showForm'])
    ->name('items.import.form');

  Route::post('items/import', [ProductExcelController::class, 'import'])
    ->name('items.import');

  Route::get('/export', [ProductExcelController::class, 'export'])
    ->name('products.export');

  Route::resource('items', ProductController::class)->parameters([
    'items' => 'product',
  ]);;
  Route::resource('attributes', AttributeController::class);
});
