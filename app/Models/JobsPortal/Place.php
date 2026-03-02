<?php

namespace App\Models\JobsPortal;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Place extends Model
{
    use HasFactory;
    use HasUlids;

    protected $table = 'places';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'name',
        'address',
        'city',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function jobs(): HasMany
    {
        return $this->hasMany(Job::class, 'place_id');
    }

    public function scopeSearch($query, ?string $search)
    {
        if (! $search) {
            return $query;
        }

        $term = '%' . trim($search) . '%';

        return $query->where(function ($q) use ($term) {
            $q->where('name', 'like', $term)
                ->orWhere('address', 'like', $term)
                ->orWhere('city', 'like', $term);
        });
    }

    public function scopeByIsActive($query, bool|int|string|null $isActive)
    {
        if ($isActive === null || $isActive === '') {
            return $query;
        }

        return $query->where('is_active', filter_var($isActive, FILTER_VALIDATE_BOOLEAN));
    }
}
