<?php

namespace App\Http\Web\Controllers\Distributors;

use App\Http\Web\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class DistributorController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('distributors/Index');
    }
}