<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class District extends Model
{
    use HasUlids,HasFactory;
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'ubigeo_id',
        'name',
        'code',
        'label',
        'searchable',
        'province_id',
    ];
    public function province()
    {
        return $this->belongsTo(Province::class, 'province_id');
    }

    public function department()
    {
        return $this->province->department();
    }

    public function address(): HasOne
    {
        return $this->hasOne(Address::class, 'district_id');
    }
}

