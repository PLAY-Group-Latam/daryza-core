<?php

namespace App\Models\Products;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class DynamicCategory extends Model
{
  use HasFactory, HasUlids;

  protected $table = 'dynamic_categories';

  protected $fillable = [
    'name',
    'slug',
    'banner_image',
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
   * Relación con Productos (Muchos a Muchos)
   * Usamos el método ->using() para que Laravel genere el ULID de la tabla pivote automáticamente.
   */
  // public function products(): BelongsToMany
  // {
  //     return $this->belongsToMany(
  //         Product::class,
  //         'product_dynamic_category',
  //         'dynamic_category_id',
  //         'product_id'
  //     )
  //     ->using(DynamicCategoryPivot::class)
  //     ->withTimestamps();
  // }

  public function variants()
  {
    // Asumiendo que tu tabla pivot se llama dynamic_category_variant
    return $this->belongsToMany(ProductVariant::class, 'dynamic_category_variant')
      ->withTimestamps();
  }

  /**
   * Scope para filtrar categorías que están vigentes según la fecha actual.
   */
  public function scopeCurrent($query)
  {
    $now = now();
    return $query->where('is_active', true)
      ->where(function ($q) use ($now) {
        $q->whereNull('starts_at')->orWhere('starts_at', '<=', $now);
      })
      ->where(function ($q) use ($now) {
        $q->whereNull('ends_at')->orWhere('ends_at', '>=', $now);
      });
  }
}
