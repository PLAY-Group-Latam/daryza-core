<?php

use App\Http\Api\v1\Controllers\Customers\Notifications\NotificationController;
use Illuminate\Support\Facades\Route;



Route::get('/notifications/public', [NotificationController::class, 'publicNotifications']);


Route::middleware('auth:api')->group(function () {

    Route::get('/notifications', [NotificationController::class, 'notifications']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/{id}/dismiss', [NotificationController::class, 'dismissNotification']);
    Route::post('/notifications/sync', [NotificationController::class, 'sync']);
});