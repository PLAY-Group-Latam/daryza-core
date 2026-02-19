<?php

namespace App\Models\Products;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProductMedia extends Model
{
    use HasFactory, HasUlids;

    protected $table = 'product_media';

    protected $fillable = [
        'type',       // image, technical_sheet, video...
        'file_path',
        'is_main',
        'folder',
        'order',
    ];

    protected $casts = [
        'is_main' => 'boolean',
        'order'   => 'integer',
    ];

    /**
     * Relación polimórfica:
     * Puede pertenecer a Product, ProductVariant, Category, etc.
     */
    public function mediable()
    {
        return $this->morphTo();
    }

    /**
     * Scopes
     */
    public function scopeImages($query)
    {
        return $query->where('type', 'image');
    }

    public function scopeVideos($query)
    {
        return $query->where('type', 'video');
    }

    public function scopeTechnicalSheets($query)
    {
        return $query->where('type', 'technical_sheet');
    }
}
