<?php

use App\Http\Web\Controllers\Blogs\BlogController;
use App\Http\Web\Controllers\Blogs\BlogCategoryController;
use Illuminate\Support\Facades\Route;

Route::prefix('blogs')->name('blogs.')->middleware('auth')->group(function () {

  // Categorías de blogs
  // Route::resource('categorias', BlogCategoryController::class)
  //     ->names('categories')
  //     ->parameters([
  //         'categorias' => 'categories',
  //     ]);

  // Blogs
  Route::resource('items', BlogController::class)
    ->names('items')
    ->parameters([
      'items' => 'blog',
    ]);
});
