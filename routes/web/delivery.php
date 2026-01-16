<?php

use App\Http\Web\Controllers\Delivery\DeliverySettingController;
use App\Http\Web\Controllers\Delivery\DeliveryZoneController;
use Illuminate\Support\Facades\Route;


Route::middleware('auth')->group(function () {
    // Route::resource('delivery-zones', DeliveryZoneController::class)
    //     ->parameters(['delivery-zones' => 'deliveryZone'])
    //     ->names('delivery-zone');

    Route::get('delivery-zones',[DeliveryZoneController::class, 'index'])
        ->name('delivery-zones.index');
    Route::post('delivery-zones', [DeliveryZoneController::class, 'store'])
        ->name('delivery-zones.store');
    Route::delete('delivery-zones/{deliveryZone}', [DeliveryZoneController::class, 'destroy'])
        ->name('delivery-zones.destroy');
    Route::post('delivery-settings', [DeliverySettingController::class, 'store'])
        ->name('delivery-settings.store');
});



