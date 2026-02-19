<?php

namespace App\Models\Products;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AttributesValue extends Model
{
    use HasFactory, HasUlids;

    protected $table = 'attributes_values'; // ✅ nombre real en DB
    protected $keyType = 'string';
    public $incrementing = false;
    protected $fillable = [
        'attribute_id',
        'value',
    ];



    /**
     * Relación con el atributo padre
     * Ej: Color
     */
    public function attribute()
    {
        return $this->belongsTo(Attribute::class, 'attribute_id');
    }
}
