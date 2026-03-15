<?php

use App\Http\Web\Controllers\Distributors\DistributorController;

Route::get('/distributors', [DistributorController::class, 'index'])
    ->name('distributors.index');