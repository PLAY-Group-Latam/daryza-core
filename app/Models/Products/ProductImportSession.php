<?php

namespace App\Models\Products;

use App\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductImportSession extends Model
{
    use HasFactory, HasUlids;

    protected $table = 'product_import_sessions';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'user_id',
        'action',
        'status',
        'file_path',
        'original_filename',
        'total_rows',
        'processed_rows',
        'failed_rows',
        'progress_percent',
        'resume_from_row',
        'summary',
        'error_message',
        'started_at',
        'finished_at',
        'retried_from_id',
    ];

    protected $casts = [
        'summary' => 'array',
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
        'total_rows' => 'integer',
        'processed_rows' => 'integer',
        'failed_rows' => 'integer',
        'progress_percent' => 'integer',
        'resume_from_row' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
