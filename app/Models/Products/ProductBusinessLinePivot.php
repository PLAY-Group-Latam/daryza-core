<?php

namespace App\Models\Products;

use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\Concerns\HasUlids;

class ProductBusinessLinePivot extends Pivot
{
    use HasUlids;

    protected $table = 'product_business_line';

    // Clave primaria no incremental (ULID)
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    public $timestamps = true;
}