<?php

use App\Http\Web\Controllers\Seo\SeoController;
use Illuminate\Support\Facades\Route;

Route::prefix('seo')->name('admin.seo.')->group(function () {
    Route::get('/', [SeoController::class, 'index'])->name('index');

    Route::get('/{id}/edit', [SeoController::class, 'edit'])->name('edit');

    Route::get('/{id}', [SeoController::class, 'show'])->name('show');
 
    Route::post('/{id}', [SeoController::class, 'update'])->name('update');
});