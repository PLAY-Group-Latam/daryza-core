<?php

namespace App\Models\Products;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUlid;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProductVariant extends Model
{
    use SoftDeletes, HasUlids, HasFactory;

    protected $table = 'product_variants';
    protected $keyType = 'string'; // ULID
    public $incrementing = false;

    protected $fillable = [
        'product_id',
        'sku',
        'price',
        'promo_price',
        'is_on_promo',
        'stock',
       
        'attributes',
    ];

    protected $casts = [
        'is_on_promo' => 'boolean',
        'attributes' => 'array', // convierte JSON automáticamente a array
        'price' => 'decimal:2',
        'promo_price' => 'decimal:2',
      
    ];

    /**
     * Relación con el producto padre
     */
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

 

    /**
     * Scope para filtrar variantes en promoción
     */
    public function scopeOnPromo($query)
    {
        return $query->where('is_on_promo', true);
    }

    /**
     * Scope para filtrar variantes con stock disponible
     */
    public function scopeInStock($query)
    {
        return $query->where('stock', '>', 0);
    }

    /**
     * Obtener precio activo: promo si existe, sino price normal
     */
    public function getActivePriceAttribute()
    {
        return $this->is_on_promo && $this->promo_price ? $this->promo_price : $this->price;
    }
        public function specifications() {
        return $this->morphMany(ProductSpecification::class, 'specifiable');
    }
}
