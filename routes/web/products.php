<?php

use App\Http\Web\Controllers\Products\AttributeController;
use App\Http\Web\Controllers\Products\BusinessLineController;
use App\Http\Web\Controllers\Products\DynamicCategoryController;
use App\Http\Web\Controllers\Products\ProductCategoryController;
use App\Http\Web\Controllers\Products\ProductController;
use App\Http\Web\Controllers\Products\ProductExcelController;
use App\Http\Web\Controllers\Products\ProductPackController;
use Illuminate\Support\Facades\Route;

Route::prefix('productos')->name('products.')->middleware('auth')->group(function () {
  Route::resource('categorias', ProductCategoryController::class)
    ->names('categories')
    ->parameters([
      'categorias' => 'category',
    ]);

  Route::get('items/import', [ProductExcelController::class, 'showForm'])
    ->name('items.import.form');

  Route::post('items/import', [ProductExcelController::class, 'import'])
    ->name('items.import');

  Route::get('items/export', [ProductExcelController::class, 'export'])
    ->name('items.export');

  Route::resource('items', ProductController::class)->parameters([
    'items' => 'product',
  ]);;

  Route::resource('lineas-de-negocio', BusinessLineController::class)
    ->names('business-lines')
    ->parameters([
      'lineas-de-negocio' => 'businessLine',
    ]);

  Route::resource('packs', ProductPackController::class)->parameters([
    'packs' => 'Pack', // Coincide con el Type-hinting del controlador
  ]);

  Route::resource('categorias-dinamicas', DynamicCategoryController::class)
    ->names('dynamic-categories')
    ->parameters([
      'categorias-dinamicas' => 'dynamicCategory',
    ]);
  Route::resource('attributes', AttributeController::class);
});
