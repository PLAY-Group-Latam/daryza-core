<?php

namespace Database\Factories\JobsPortal;

use App\Models\JobsPortal\Application;
use App\Models\JobsPortal\Job;
use Illuminate\Database\Eloquent\Factories\Factory;

class ApplicationFactory extends Factory
{
    protected $model = Application::class;

    public function definition(): array
    {
        return [
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'email' => fake()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'cv_path' => 'applications/cv/' . fake()->uuid() . '.pdf',
            'job_id' => Job::factory(),
        ];
    }
}
