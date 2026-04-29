<?php
namespace App\Models\Settings;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUlids;

class Script extends Model
{
    use HasUlids;

    const PLACEMENT_HEAD = 'head';
    const PLACEMENT_BODY = 'body';
    const PLACEMENTS = [self::PLACEMENT_HEAD, self::PLACEMENT_BODY];

    protected $fillable = [
        'name',
        'placement',
        'consent_type',
        'active',
        'content',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('active', true);
    }

    public function scopePlacement(Builder $query, string $placement): Builder
    {
        return $query->where('placement', $placement);
    }
}
