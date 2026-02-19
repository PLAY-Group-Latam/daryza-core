<?php

namespace App\Models\Products;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ProductVariantAttributeValue extends Model
{
  use HasFactory, HasUlids;

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
   * Valor del atributo (ej: Rojo, Azul, XL) esto se borra y se usa option
   */
  public function attributeValue()
  {
    return $this->belongsTo(AttributesValue::class, 'attribute_value_id');
  }
  /**
   * El valor real del atributo (ej: Rojo, XL).
   * Cambiamos el nombre a 'option' para que sea más corto y claro.
   */
  public function option()
  {
    return $this->belongsTo(AttributesValue::class, 'attribute_value_id');
  }
}
