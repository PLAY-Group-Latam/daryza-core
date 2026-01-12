<?php

use App\Http\Web\Controllers\Scripts\ScriptController;
use Illuminate\Support\Facades\Route;


Route::middleware('auth')->group(function () {
  Route::prefix('scripts')->name('scripts.')->group(function () {
        // Ruta para listar los scripts
        Route::get('/', [ScriptController::class, 'index'])->name('index');

        // Ruta para crear un nuevo script
        Route::post('/', [ScriptController::class, 'store'])->name('store');

        // Ruta para editar un script (puede ser un formulario de actualización)
        Route::put('/{script}', [ScriptController::class, 'update'])->name('update');

        // Ruta para eliminar un script
        Route::delete('/{script}', [ScriptController::class, 'destroy'])->name('destroy');
    });
});

