<?php

namespace App\Models\Products;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProductSpecification extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'name',
        'value',
    ];

    /**
     * Producto al que pertenece
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

     public function specifiable() {
        return $this->morphTo();
    }
}
