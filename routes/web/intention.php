<?php

use App\Http\Web\Controllers\PurchaseIntention\PurchaseIntentionController;
use Illuminate\Support\Facades\Route;

Route::prefix('intention-purchase')->name('purchase-intent.')->group(function () {

    Route::get('/search-customers', [PurchaseIntentionController::class, 'searchCustomers'])->name('search-customers');
    Route::get('/search-events', [PurchaseIntentionController::class, 'searchEvents'])->name('search-events');
    Route::get('/', [PurchaseIntentionController::class, 'index'])->name('index');
    Route::get('/{customer}', [PurchaseIntentionController::class, 'show'])->name('show');
    Route::delete('/{eventLog}', [PurchaseIntentionController::class, 'destroy'])->name('destroy');
});