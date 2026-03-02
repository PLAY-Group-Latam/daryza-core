<?php

namespace Database\Factories\JobsPortal;

use App\Models\JobsPortal\Place;
use Illuminate\Database\Eloquent\Factories\Factory;

class PlaceFactory extends Factory
{
    protected $model = Place::class;

    public function definition(): array
    {
        return [
            'name' => fake()->company() . ' HQ',
            'address' => fake()->address(),
            'city' => fake()->city(),
            'is_active' => fake()->boolean(85),
        ];
    }
}
