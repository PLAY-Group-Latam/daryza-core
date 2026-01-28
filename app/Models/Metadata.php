<?php

namespace App\Models;

use App\Enums\OgType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;

class Metadata extends Model
{
    use SoftDeletes, HasFactory, HasUlids;

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
    protected $casts = [
        'og_type' => OgType::class,
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
