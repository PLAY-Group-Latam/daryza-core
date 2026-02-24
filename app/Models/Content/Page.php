<?php

namespace App\Models\Content;

use App\Models\Metadata;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Page extends Model
{
    use HasFactory;

    protected $table = 'pages';

    protected $fillable = [
        'title',
        'slug',
        'type',
        'status',
        'published_at',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    
    public function sections(): HasMany
    {
        return $this->hasMany(PageSection::class)
            ->orderBy('sort_order');
    }

    public function metadata()
    {
        return $this->morphOne(Metadata::class, 'metadatable');
    }
}
