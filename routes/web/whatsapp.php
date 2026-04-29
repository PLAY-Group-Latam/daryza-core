<?php

use App\Http\Web\Controllers\Settings\WhatsappSettingController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::prefix('whatsapp-settings')->name('whatsapp-settings.')->group(function () {
        Route::get('/', [WhatsappSettingController::class, 'index'])->name('index');
        Route::post('/', [WhatsappSettingController::class, 'store'])->name('store');
    });
});
