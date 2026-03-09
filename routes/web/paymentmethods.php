<?php

use App\Http\Web\Controllers\Settings\PaymentMethodController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    
    Route::prefix('metodos-de-pago')->name('paymentMethods.')->group(function () {
        
        // Vista principal (Lista)
        Route::get('/', [PaymentMethodController::class, 'index'])->name('index');
        
        // Vistas de formularios (Páginas independientes)
        Route::get('/crear', [PaymentMethodController::class, 'create'])->name('create');
        Route::get('/{paymentMethod}/editar', [PaymentMethodController::class, 'edit'])->name('edit');
        
        // Acciones de API / Backend
        Route::post('/', [PaymentMethodController::class, 'store'])->name('store');
        Route::put('/{paymentMethod}', [PaymentMethodController::class, 'update'])->name('update');
        Route::delete('/{paymentMethod}', [PaymentMethodController::class, 'destroy'])->name('destroy');
        
    });

});
