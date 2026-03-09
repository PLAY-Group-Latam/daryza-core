<?php

namespace Database\Factories\JobsPortal;

use App\Models\JobsPortal\Area;
use Illuminate\Database\Eloquent\Factories\Factory;

class AreaFactory extends Factory
{
    protected $model = Area::class;

    public function definition(): array
    {
        return [
            'name' => fake()->unique()->jobTitle(),
            'is_active' => fake()->boolean(85),
        ];
    }
}
