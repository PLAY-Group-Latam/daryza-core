<?php

use App\Http\Api\v1\Controllers\Customers\Notifications\NotificationController;
use Illuminate\Support\Facades\Route;

Route::get('/notifications/public', [NotificationController::class, 'publicNotifications']);
Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
Route::get('/notifications/products', [NotificationController::class, 'notifications']);
Route::delete('/notifications/{id}', [NotificationController::class, 'deleteNotification']);
