<?php

use Illuminate\Support\Facades\Route;
use App\Http\Web\Controllers\Dashboard\DashBoardController;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function (Request $request) {
    if ($request->user()) {
        return to_route('dashboard');
    }

    return Inertia::render('auth/login', [
        'canResetPassword' => Features::enabled(Features::resetPasswords()),
        'status' => $request->session()->get('status'),
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
require __DIR__ . '/distributors.php';
require __DIR__ . '/coupon.php';
require __DIR__ . '/intention.php';
