<?php

namespace App\Models\Content;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class PageSection extends Model
{
    use HasFactory;

    protected $table = 'page_sections';

    protected $fillable = [
        'page_id',
        'name',
        'type',
        'sort_order',
        'is_active',
        'settings',
    ];

    protected $casts = [
        'settings' => 'array',
        'is_active' => 'boolean',
    ];

    
    public function page(): BelongsTo
    {
        return $this->belongsTo(Page::class);
    }

    public function content(): HasOne
    {
        return $this->hasOne(SectionContent::class);
    }
}
