<?php

use App\Http\Web\Controllers\JobsPortal\ApplicationController;
use App\Http\Web\Controllers\JobsPortal\AreaController;
use App\Http\Web\Controllers\JobsPortal\JobController;
use App\Http\Web\Controllers\JobsPortal\PlaceController;
use App\Http\Web\Controllers\JobsPortal\PublicJobController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin/jobs')->name('admin.jobs.')->middleware('auth')->group(function () {
    Route::resource('places', PlaceController::class)->except(['show'])->parameters(['places' => 'place']);
    Route::resource('departments', AreaController::class)->except(['show'])->parameters(['departments' => 'area']);
    Route::resource('offers', JobController::class)->except(['show'])->parameters(['offers' => 'job']);

    Route::get('applications', [ApplicationController::class, 'index'])->name('applications.index');
    Route::get('applications/{application}', [ApplicationController::class, 'show'])->name('applications.show');
    Route::delete('applications/{application}', [ApplicationController::class, 'destroy'])->name('applications.destroy');
});

Route::prefix('jobs-portal')->name('portal.jobs.')->group(function () {
    Route::get('offers', [PublicJobController::class, 'index'])->name('index');
    Route::get('offers/{slug}', [PublicJobController::class, 'show'])->name('show');
    Route::post('applications', [PublicJobController::class, 'apply'])->name('apply');
});
