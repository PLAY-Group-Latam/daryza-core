<?php

namespace App\Models\Products;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Attribute extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'is_filterable',
    ];

    /**
     * Valores asociados a este atributo
     */
    public function values()
    {
        return $this->hasMany(AttributeValue::class);
    }
}
