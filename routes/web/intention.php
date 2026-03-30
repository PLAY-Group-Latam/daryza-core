<?php

use App\Http\Web\Controllers\PurchaseIntention\PurchaseIntentionController;
use Illuminate\Support\Facades\Route;

Route::prefix('intention-purchase')->name('purchase-intent.')->group(function () {
    
    // Rutas de búsqueda o filtros (siguiendo tu lógica de coupons)
    Route::get('/search-customers', [PurchaseIntentionController::class, 'searchCustomers'])->name('search-customers');
    Route::get('/search-events', [PurchaseIntentionController::class, 'searchEvents'])->name('search-events');

    // Rutas principales del módulo
    Route::get('/', [PurchaseIntentionController::class, 'index'])->name('index');
    
    // Ver detalle de la intención de un cliente específico
    Route::get('/{customer}', [PurchaseIntentionController::class, 'show'])->name('show');
    
    // Por si necesitas eliminar registros de logs antiguos
    Route::delete('/{eventLog}', [PurchaseIntentionController::class, 'destroy'])->name('destroy');
});