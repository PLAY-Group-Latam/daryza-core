<?php

namespace App\Models\Products;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProductSpecification extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'value',
    ];

    /**
     * Relación polimórfica
     * Puede pertenecer a Product, ProductVariant, etc.
     */
    public function specifiable()
    {
        return $this->morphTo();
    }
}
