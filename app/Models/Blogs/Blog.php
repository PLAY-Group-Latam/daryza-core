<?php

namespace App\Models\Blogs;

use App\Models\Metadata;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Blog extends Model
{
  protected $table = 'blogs';
  protected $keyType = 'string';
  public $incrementing = false;

  protected $fillable = [
    'title',
    'slug',
    'description',
    'content',
    'image',
    'visibility',
    'author',
    'miniature',
    'publication_date',
  ];

  public function metadata()
  {
    return $this->morphOne(Metadata::class, 'metadatable');
  }


  /**
   * Relación muchos a muchos con BlogCategory
   */
  public function categories(): BelongsToMany
  {
    return $this->belongsToMany(
      BlogCategory::class,
      'blog_category_blog',
      'blog_id',
      'category_id'
    )->withTimestamps();
  }
}
