<?php

namespace App\Models\Products;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;

class ProductMetadata extends Model
{
    use SoftDeletes, HasFactory, HasUlids;

    protected $table = 'product_metadata';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
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
     * Relación polimórfica:
     * Puede pertenecer a Product, Category, Page, etc.
     */
    public function metadatable()
    {
        return $this->morphTo();
    }
}
