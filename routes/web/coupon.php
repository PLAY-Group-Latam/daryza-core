<?php

use App\Http\Web\Controllers\Coupons\CouponController;
use Illuminate\Support\Facades\Route;

Route::prefix('coupon')->name('coupons.')->group(function () {
    
    Route::get('/search-products', [CouponController::class, 'searchProducts'])->name('search-products');
    Route::get('/search-packs', [CouponController::class, 'searchPacks'])->name('search-packs');
    Route::get('/search-business-lines', [CouponController::class, 'searchBusinessLines'])->name('search-business-lines');
    Route::get('/search-customers', [CouponController::class, 'searchCustomers'])->name('search-customers');
    Route::get('/search-categories', [CouponController::class, 'searchCategories'])->name('search-categories');

    Route::get('/', [CouponController::class, 'index'])->name('index');
    Route::get('/crear', [CouponController::class, 'create'])->name('create');
    Route::post('/', [CouponController::class, 'store'])->name('store');
    Route::get('/{coupon}/editar', [CouponController::class, 'edit'])->name('edit');
    Route::put('/{coupon}', [CouponController::class, 'update'])->name('update');
    Route::delete('/{coupon}', [CouponController::class, 'destroy'])->name('destroy');
});