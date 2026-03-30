<?php

namespace Database\Factories\JobsPortal;

use App\Models\JobsPortal\Area;
use Illuminate\Database\Eloquent\Factories\Factory;

class AreaFactory extends Factory
{
    protected $model = Area::class;
    protected static int $sequence = 0;

    public function definition(): array
    {
        $index = ++static::$sequence;
        $areas = [
            'Comercial',
            'Operaciones',
            'Logistica',
            'Marketing',
            'Finanzas',
            'Atencion al Cliente',
        ];

        return [
            'name' => $areas[($index - 1) % count($areas)] . " {$index}",
            'is_active' => true,
        ];
    }
}
