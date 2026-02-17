<?php

namespace App\Models\Products;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductSpecificationValue extends Model
{
    use HasFactory, HasUlids;

    protected $table = 'product_specification_values';
    protected $primaryKey = 'id';
    public $incrementing = false; // ULID
    protected $keyType = 'string';

    protected $fillable = [
        'product_variant_id',
        'attribute_id',
        'attribute_value_id',
        'value',
    ];

    // Relaciones

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    public function attribute(): BelongsTo
    {
        return $this->belongsTo(Attribute::class);
    }

    public function attributeValue(): BelongsTo
    {
        return $this->belongsTo(AttributesValue::class, 'attribute_value_id');
    }

    //accesor 
    public function getSpecificationAttribute(): ?string
    {
        return $this->attribute_value_id
            ? $this->attributeValue?->value
            : $this->value;
    }
}
