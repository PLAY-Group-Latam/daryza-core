<?php

use App\Http\Api\v1\Controllers\Settings\ScriptController;
use Illuminate\Support\Facades\Route;


Route::prefix('scripts')->group(function () {
    Route::get('/getScripts', [ScriptController::class, 'index']);
});
