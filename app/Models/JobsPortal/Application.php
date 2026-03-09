<?php

namespace App\Models\JobsPortal;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Application extends Model
{
    use HasFactory;
    use HasUlids;

    protected $table = 'applications';

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'cv_path',
        'job_id',
    ];

    public function job(): BelongsTo
    {
        return $this->belongsTo(Job::class, 'job_id');
    }

    public function scopeByEmail($query, ?string $email)
    {
        return $email ? $query->where('email', 'like', '%' . trim($email) . '%') : $query;
    }
}
