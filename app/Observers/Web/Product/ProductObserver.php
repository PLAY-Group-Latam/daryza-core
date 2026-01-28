<?php

namespace App\Observers\Web\Product;

use App\Http\Web\Services\Products\ProductCodeGenerator;
use App\Models\Products\Product;

class ProductObserver
{
    public function creating(Product $product): void
    {
        if (empty($product->code)) {
            $generator = app(ProductCodeGenerator::class);
            $product->code = $generator->generate();
        }
    }
}
