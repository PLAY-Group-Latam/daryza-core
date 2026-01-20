<?php

namespace App\Models\Products;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProductMetadata extends Model
{
    use SoftDeletes, HasFactory, HasUlids;

    protected $table = 'product_metadata';
    protected $keyType = 'string'; // UUID
    public $incrementing = false;

    protected $fillable = [
        'product_id',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'og_title',
        'og_description',
        'og_image',
        'og_type',
        'canonical_url',
        'noindex',
        'nofollow',
    ];

    /**
     * Relación con el producto
     */
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}
