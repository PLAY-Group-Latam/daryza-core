<?php

namespace App\Models\Products;

use Illuminate\Database\Eloquent\Model;

class ProductVariantAttributeValue extends Model
{
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
   * Valor del atributo asociado
   */
  public function attributeValue()
  {
    return $this->belongsTo(AttributeValue::class, 'attribute_value_id');
  }
  public function media()
  {
    return $this->morphMany(ProductMedia::class, 'mediable');
  }
}
