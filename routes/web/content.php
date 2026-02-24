<?php

use App\Http\Web\Controllers\Content\ContentController;
use Illuminate\Support\Facades\Route;


Route::prefix('content')->name('content.')->middleware('auth')->group(function () {
    
   
    Route::get('/items', [ContentController::class, 'index'])->name('index');
    Route::get('/{slug}/{type}/{id}', [ContentController::class, 'edit'])->name('edit');
    Route::put('/update/{slug}/{type}/{id}', [ContentController::class, 'update'])->name('update');
    

});