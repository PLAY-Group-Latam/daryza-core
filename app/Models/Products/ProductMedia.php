<?php

namespace App\Models\Products;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUlids;

class ProductMedia extends Model
{
    use HasFactory, SoftDeletes, HasUlids;

    protected $table = 'product_media';

    protected $fillable = [
        'product_id',
        'variant_id',
        'type',       // 'image', 'technical_sheet', 'video', etc
        'file_path',  // URL o ruta del archivo
        'is_main',    // solo para imágenes principales
        'order',      // para ordenar galerías
    ];

    protected $casts = [
        'is_main' => 'boolean',
        'order' => 'integer',
    ];

    /**
     * Relación con el producto padre
     */
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    /**
     * Relación con la variante (opcional)
     */
    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }

    /**
     * Scope para obtener solo imágenes
     */
    public function scopeImages($query)
    {
        return $query->where('type', 'image');
    }

    /**
     * Scope para obtener solo fichas técnicas
     */
    public function scopeTechnicalSheets($query)
    {
        return $query->where('type', 'technical_sheet');
    }

    /**
     * Scope para la imagen principal
     */
    public function scopeMain($query)
    {
        return $query->where('type', 'image')->where('is_main', true);
    }

    /**
     * Scope para ordenar por campo 'order'
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order', 'asc');
    }
}
