<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUlids;

class Script extends Model
{
    use HasUlids;

    protected $table = 'scripts';
    protected $primaryKey = 'id';
    public $incrementing = false; // porque usas ULID
    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'placement',
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

