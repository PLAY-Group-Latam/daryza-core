<?php

use App\Http\Api\v1\Controllers\UbigeoController;
use Illuminate\Support\Facades\Route;

Route::prefix('ubigeos')->group(function () {
    Route::get('/departments', [UbigeoController::class, 'departments']);
    Route::get('/departments/{id}/provinces', [UbigeoController::class, 'provinces']);
    Route::get('/provinces/{id}/districts', [UbigeoController::class, 'districts']);

    // Checkout: solo ubigeos con cobertura de delivery.
    Route::get('/checkout/departments', [UbigeoController::class, 'checkoutDepartments']);
    Route::get('/checkout/departments/{id}/provinces', [UbigeoController::class, 'checkoutProvinces']);
    Route::get('/checkout/provinces/{id}/districts', [UbigeoController::class, 'checkoutDistricts']);
});
