<?php

namespace App\Models\Landings;

use App\Models\Metadata;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class Landing extends Model
{
    use HasFactory, HasUlids;

    protected $table = 'landings';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'title',
        'slug',
        'sections',
        'is_active',
    ];

    protected $casts = [
        'sections' => 'array',
        'is_active' => 'boolean',
    ];

    public function metadata(): MorphOne
    {
        return $this->morphOne(Metadata::class, 'metadatable');
    }

    public function leads()
    {
        return $this->hasMany(\App\Models\Landings\LandingLead::class, 'landing_id');
    }
}
