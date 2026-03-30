<?php

namespace Database\Factories\JobsPortal;

use App\Models\JobsPortal\Application;
use App\Models\JobsPortal\Job;
use Illuminate\Database\Eloquent\Factories\Factory;

class ApplicationFactory extends Factory
{
    protected $model = Application::class;
    protected static int $sequence = 0;

    public function definition(): array
    {
        $index = ++static::$sequence;
        $firstNames = ['Carlos', 'Maria', 'Jose', 'Lucia', 'Jorge', 'Ana'];
        $lastNames = ['Perez', 'Rojas', 'Gomez', 'Vargas', 'Torres', 'Diaz'];
        $firstName = $firstNames[($index - 1) % count($firstNames)];
        $lastName = $lastNames[($index - 1) % count($lastNames)];

        return [
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => strtolower("{$firstName}.{$lastName}.{$index}@example.test"),
            'phone' => '9' . str_pad((string) $index, 8, '0', STR_PAD_LEFT),
            'cv_path' => "applications/cv/application-{$index}.pdf",
            'job_id' => Job::factory(),
        ];
    }
}
