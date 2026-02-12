<?php

namespace App\Models\Content;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SectionContent extends Model
{
    use HasFactory;

    protected $table = 'section_contents';

    protected $fillable = [
        'page_section_id',
        'content',
    ];

    protected $casts = [
        'content' => 'array', 
    ];

   

    public function section(): BelongsTo
    {
        return $this->belongsTo(PageSection::class, 'page_section_id');
    }
}
