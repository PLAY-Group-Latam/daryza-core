<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Province extends Model
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
        'children_count',
        'department_id',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id');
    }
    public function districts()
    {
        return $this->hasMany(District::class, 'province_id');
    }
    public function address(): HasOne
    {
        return $this->hasOne(Address::class, 'province_id');
    }
}

