<?php

namespace App\Http\Api\v1\Services\Distributors;

use App\Models\Distributors\Distributor;
use App\Http\Web\Services\GcsService;
use Illuminate\Support\Collection;

class DistributorService
{
    public function getAllForMap(): Collection
    {
        return Distributor::all();
    }
}