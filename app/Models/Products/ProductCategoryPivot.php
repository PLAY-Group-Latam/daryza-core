<?php

namespace App\Models\Products;

use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProductCategoryPivot extends Pivot
{
    use HasFactory, HasUlids;

    protected $table = 'product_category';

    
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = true;
}