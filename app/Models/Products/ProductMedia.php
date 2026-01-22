<?php

namespace App\Models\Products;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProductMedia extends Model
{
    use HasFactory;

    protected $table = 'product_media';

    protected $fillable = [
        'type',       // image, technical_sheet, video...
        'file_path',
        'is_main',
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

    public function scopeTechnicalSheets($query)
    {
        return $query->where('type', 'technical_sheet');
    }

    public function scopeMain($query)
    {
        return $query->where('type', 'image')
            ->where('is_main', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order', 'asc');
    }
}
