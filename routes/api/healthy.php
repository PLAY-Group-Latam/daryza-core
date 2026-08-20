<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

Route::get('/health', function (Request $request) {

    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->timestamp,
    ], 200);
})->middleware(['throttle:30,1']);