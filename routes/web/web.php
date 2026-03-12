<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Web\Controllers\Dashboard\DashBoardController;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Cambiamos la función por el controlador
    Route::get('dashboard', [DashBoardController::class, 'index'])->name('dashboard');
});
require __DIR__ . '/settings.php';
require __DIR__ . '/users.php';
require __DIR__ . '/customers.php';
require __DIR__ . '/delivery.php';
require __DIR__ . '/scripts.php';
require __DIR__ . '/products.php';
require __DIR__ . '/blogs.php';
require __DIR__ . '/leads.php';
require __DIR__ . '/content.php';
require __DIR__ . '/jobs_portal.php';
require __DIR__ . '/paymentmethods.php';
require __DIR__ . '/seo.php';
require __DIR__ . '/orders.php';
