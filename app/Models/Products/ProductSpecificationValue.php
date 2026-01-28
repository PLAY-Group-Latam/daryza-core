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
        'product_id',
        'attribute_id',
        'attribute_value_id',
        'value',
    ];

    // Relaciones

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function attribute(): BelongsTo
    {
        return $this->belongsTo(Attribute::class);
    }

    public function attributeValue(): BelongsTo
    {
        return $this->belongsTo(AttributesValue::class, 'attribute_value_id');
    }
}
