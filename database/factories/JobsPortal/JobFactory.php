<?php

namespace Database\Factories\JobsPortal;

use App\Enums\JobModality;
use App\Models\JobsPortal\Area;
use App\Models\JobsPortal\Job;
use App\Models\JobsPortal\Place;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class JobFactory extends Factory
{
    protected $model = Job::class;

    public function definition(): array
    {
        $title = fake()->sentence(4);

        return [
            'title' => $title,
            'slug' => Str::slug($title) . '-' . Str::lower(Str::random(6)),
            'description' => fake()->paragraphs(4, true),
            'requirements' => [fake()->sentence(), fake()->sentence()],
            'benefits' => [fake()->sentence(), fake()->sentence()],
            'modality' => fake()->randomElement(JobModality::cases()),
            'vacancies' => fake()->numberBetween(1, 10),
            'is_active' => fake()->boolean(85),
            'area_id' => Area::factory(),
            'place_id' => Place::factory(),
        ];
    }
}
