<?php

use App\Http\Api\v1\Controllers\Scripts\ScriptController;
use Illuminate\Support\Facades\Route;

# Scripts públicos (Head / Body)
Route::prefix('scripts')->group(function () {
    Route::get('/', [ScriptController::class, 'index'])
        ->name('api.scripts.index');
});

