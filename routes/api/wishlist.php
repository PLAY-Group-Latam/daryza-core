<?php

use App\Http\Api\v1\Controllers\Customers\WishList\WishListController;
use Illuminate\Support\Facades\Route;


Route::prefix('wishlist')->middleware('auth:api')->group(function () {
    
    Route::get('/', [WishListController::class, 'index']);
    Route::get('/count', [WishListController::class, 'count']);
    Route::post('/toggle', [WishListController::class, 'toggle']);
    
});