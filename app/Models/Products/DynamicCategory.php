<?php

namespace App\Models\Products;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DynamicCategory extends Model
{
  use HasFactory, HasUlids, SoftDeletes;

  protected $fillable = [
    'name',
    'slug',
    'is_active',
    'starts_at',
    'ends_at',
  ];

  protected $casts = [
    'is_active' => 'boolean',
    'starts_at' => 'datetime',
    'ends_at'   => 'datetime',
  ];

  /**
   * Relación con los items vinculados.
   * Usamos esto para el with(['items.variant.product'])
   */
  public function items(): HasMany
  {
    return $this->hasMany(DynamicCategoryItem::class, 'dynamic_category_id');
  }
}
