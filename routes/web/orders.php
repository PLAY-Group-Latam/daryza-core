<?php

use App\Http\Web\Controllers\Orders\OrderController;
use Illuminate\Support\Facades\Route;

Route::prefix('ordenes')->name('orders.')->middleware('auth')->group(function () {
    Route::get('/', [OrderController::class, 'index'])->name('index');
    Route::get('/{order}', [OrderController::class, 'show'])->name('show');

    Route::patch('/{order}/status', [OrderController::class, 'updateStatus'])->name('status.update');
    Route::patch('/{order}/payment-status', [OrderController::class, 'updatePaymentStatus'])->name('payment-status.update');
    Route::patch('/{order}/shipping-status', [OrderController::class, 'updateShippingStatus'])->name('shipping-status.update');
    Route::patch('/{order}/admin-action', [OrderController::class, 'updateAdminAction'])->name('admin-action.update');
    Route::patch('/admin-action/bulk', [OrderController::class, 'updateAdminActionBulk'])->name('admin-action.bulk');
});
