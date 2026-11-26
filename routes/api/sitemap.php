<?php

use App\Http\Api\v1\Controllers\Sitemap\SitemapController;
use Illuminate\Support\Facades\Route;

Route::prefix('sitemap')->group(function () {
    Route::get('products', [SitemapController::class, 'products']);
    Route::get('packs', [SitemapController::class, 'packs']);
    Route::get('blogs', [SitemapController::class, 'blogs']);
    Route::get('jobs', [SitemapController::class, 'jobs']);
});
