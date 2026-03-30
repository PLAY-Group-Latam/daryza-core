<?php

namespace Database\Factories\JobsPortal;

use App\Models\JobsPortal\Place;
use Illuminate\Database\Eloquent\Factories\Factory;

class PlaceFactory extends Factory
{
    protected $model = Place::class;
    protected static int $sequence = 0;

    public function definition(): array
    {
        $index = ++static::$sequence;
        $cities = ['Lima', 'Arequipa', 'Trujillo', 'Piura', 'Cusco'];
        $city = $cities[($index - 1) % count($cities)];

        return [
            'name' => "Sede {$index} {$city}",
            'address' => "Av. Principal {$index} - {$city}",
            'city' => $city,
            'is_active' => true,
        ];
    }
}
