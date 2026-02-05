<?php

namespace App\Http\Web\Services\Products;

use App\Models\Products\Product;

class ProductCodeGenerator
{
    public function generate(): string
    {
        $lastProduct = Product::withTrashed()
            ->orderByDesc('created_at')
            ->first();

        $lastNumber = 0;

        if ($lastProduct && $lastProduct->code) {
            $lastNumber = (int) str_replace('PRD-', '', $lastProduct->code);
        }

        $next = $lastNumber + 1;

        return 'PRD-' . str_pad($next, 6, '0', STR_PAD_LEFT);
    }
}
