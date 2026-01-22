<?php

namespace App\Models\Blogs;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class BlogCategory extends Model
{
  protected $table = 'blog_categories';
  protected $keyType = 'string';
  public $incrementing = false;

  protected $fillable = [
    'name',
  ];

  /**
   * Relación muchos a muchos con Blog
   */
  public function blogs(): BelongsToMany
  {
    return $this->belongsToMany(
      Blog::class,
      'blog_category_blog',
      'category_id',
      'blog_id'
    )->withTimestamps();
  }
}
