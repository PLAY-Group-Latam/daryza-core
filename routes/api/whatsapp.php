<?php

use App\Http\Api\v1\Controllers\Settings\WhatsappSettingController;
use Illuminate\Support\Facades\Route;

Route::prefix('whatsapp')->group(function () {
    Route::get('/settings', [WhatsappSettingController::class, 'show']);
});
