<?php

namespace App\Models\Products;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProductVariantAttributeValue extends Model
{
  use HasFactory;

  protected $table = 'product_variant_attribute_values';

  protected $fillable = [
    'product_variant_id',
    'attribute_value_id',
  ];

  /**
   * Variante asociada
   */
  public function variant()
  {
    return $this->belongsTo(ProductVariant::class, 'product_variant_id');
  }

  /**
   * Valor del atributo (ej: Rojo, Azul, XL)
   */
  public function attributeValue()
  {
    return $this->belongsTo(AttributeValue::class, 'attribute_value_id');
  }

  /**
   * Media específica de esta combinación
   * Ej: imagen del color rojo real
   */
  public function media()
  {
    return $this->morphMany(ProductMedia::class, 'mediable');
  }
}
