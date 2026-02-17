<?php

namespace App\Models\Products;

use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\Concerns\HasUlids;

class DynamicCategoryPivot extends Pivot
{
  use HasUlids;

  protected $table = 'product_dynamic_category';

  /**
   * Indicamos que la llave primaria no es autoincremental
   */
  public $incrementing = false;
  protected $keyType = 'string';

  // Importante si tu migración tiene timestamps
  public $timestamps = true;
}
