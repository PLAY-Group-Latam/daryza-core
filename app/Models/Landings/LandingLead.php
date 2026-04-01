<?php

namespace App\Models\Landings;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LandingLead extends Model
{
    use HasUlids, SoftDeletes;

    protected $table = 'landing_leads';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'landing_id',
        'form_key',
        'campaign_key',
        'full_name',
        'email',
        'phone',
        'data',
        'source_data',
        'page_url',
        'referrer',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'data' => 'array',
        'source_data' => 'array',
    ];

    public function landing()
    {
        return $this->belongsTo(Landing::class, 'landing_id');
    }
}
