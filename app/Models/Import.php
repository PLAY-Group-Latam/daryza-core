<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Import extends Model
{
    use HasUlids,HasFactory; // Para generar ULID automáticamente al crear registros

    /**
     * El tipo de clave primaria.
     *
     * @var string
     */
    protected $keyType = 'string';

    /**
     * Indica que la clave primaria no es auto-incremental.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * Los atributos que se pueden asignar masivamente.
     *
     * @var array
     */
    protected $fillable = [
        'file_name',
        'path',
        'status',
        'error_message',
    ];

    /**
     * Valores por defecto para los atributos.
     *
     * @var array
     */
    protected $attributes = [
        'status' => 'pending',
    ];
}