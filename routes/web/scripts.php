<?php

use App\Http\Web\Controllers\Settings\ScriptController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::prefix('scripts')->name('scripts.')->group(function () {
        Route::get('/', [ScriptController::class, 'index'])->name('index');
        Route::get('/create', [ScriptController::class, 'create'])->name('create');
        Route::post('/', [ScriptController::class, 'store'])->name('store');
        Route::get('/{script}/edit', [ScriptController::class, 'edit'])->name('edit');
        Route::put('/{script}', [ScriptController::class, 'update'])->name('update');
        Route::delete('/{script}', [ScriptController::class, 'destroy'])->name('destroy');
    });
});
