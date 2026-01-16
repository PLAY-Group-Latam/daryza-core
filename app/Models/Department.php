<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Department extends Model
{
    use HasUlids,HasFactory;
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'ubigeo_id',
        'name',
        'code',
        'code_ISO_3166',
        'label',
        'searchable',
        'children_count',
    ];

    public function provinces()
    {
        return $this->hasMany(Province::class, 'department_id');
    }

    public function address(): HasOne
    {
        return $this->hasOne(Address::class, 'department_id');
    }
}

