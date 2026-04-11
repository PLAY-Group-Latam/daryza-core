<?php

namespace App\Http\Api\v1\Services\Products;

use App\Models\Products\BusinessLine;
use Illuminate\Database\Eloquent\Collection;

class BusinessLineService 
{
    
    public function getActiveBusinessLines(): Collection
    {
        return BusinessLine::where('is_active', true)
            ->latest() 
            ->limit(10)
            ->get();
    }
}