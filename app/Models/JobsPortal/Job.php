<?php

namespace App\Models\JobsPortal;

use App\Enums\JobModality;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Job extends Model
{
    use HasFactory;
    use HasUlids;

    protected $table = 'job_offers';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'requirements',
        'benefits',
        'modality',
        'vacancies',
        'is_active',
        'area_id',
        'place_id',
    ];

    protected $casts = [
        'requirements' => 'array',
        'benefits' => 'array',
        'modality' => JobModality::class,
        'vacancies' => 'integer',
        'is_active' => 'boolean',
    ];

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class, 'area_id');
    }

    public function place(): BelongsTo
    {
        return $this->belongsTo(Place::class, 'place_id');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class, 'job_id');
    }

    public function scopeSearch($query, ?string $search)
    {
        if (! $search) {
            return $query;
        }

        $term = '%' . trim($search) . '%';

        return $query->where(function ($q) use ($term) {
            $q->where('title', 'like', $term)
                ->orWhere('description', 'like', $term);
        });
    }

    public function scopeByArea($query, ?string $areaId)
    {
        return $areaId ? $query->where('area_id', $areaId) : $query;
    }

    public function scopeByPlace($query, ?string $placeId)
    {
        return $placeId ? $query->where('place_id', $placeId) : $query;
    }

    public function scopeByModality($query, ?string $modality)
    {
        return $modality ? $query->where('modality', $modality) : $query;
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByIsActive($query, bool|int|string|null $isActive)
    {
        if ($isActive === null || $isActive === '') {
            return $query;
        }

        return $query->where('is_active', filter_var($isActive, FILTER_VALIDATE_BOOLEAN));
    }
}
