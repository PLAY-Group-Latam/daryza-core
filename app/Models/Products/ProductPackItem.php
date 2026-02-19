<?php

namespace App\Models\Products;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductPackItem extends Model
{
    protected $fillable = [
        'product_pack_id',
        'product_id', // El ULID del producto padre
        'variant_id', // El ID de la variante (color/talla)
        'quantity',
    ];

    protected $casts = [
        'dynamic_attributes' => 'array', // Crucial para manejar el JSON como array de PHP
        'quantity' => 'integer',
    ];

    /**
     * El pack al que pertenece este item
     */
    public function pack(): BelongsTo
    {
        return $this->belongsTo(ProductPack::class, 'product_pack_id');
    }

    /**
     * El producto base (ULID)
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    /**
     * La variante específica seleccionada (Color, SKU Rubbermaid, etc)
     */
    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }
}
