<?php

namespace App\Http\Api\v1\Services\Products;

use App\Models\Products\Brand;
use Illuminate\Support\Collection;

class BrandService
{
    public function getAll(): Collection
    {
        return Brand::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'image']);
    }
}