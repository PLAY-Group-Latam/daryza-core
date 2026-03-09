<?php

namespace Database\Seeders;

use App\Enums\JobModality;
use App\Models\JobsPortal\Application;
use App\Models\JobsPortal\Area;
use App\Models\JobsPortal\Job;
use App\Models\JobsPortal\Place;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class JobsPortalSeeder extends Seeder
{
    public function run(): void
    {
        $areas = collect([
            'Technology',
            'Marketing',
            'Sales',
            'Operations',
            'Finance',
            'Human Resources',
        ])->mapWithKeys(fn (string $name) => [
            $name => Area::firstOrCreate(['name' => $name], ['is_active' => true]),
        ]);

        $places = collect([
            ['name' => 'Lima HQ', 'address' => 'Av. Javier Prado 1234', 'city' => 'Lima', 'is_active' => true],
            ['name' => 'Arequipa Office', 'address' => 'Calle Mercaderes 455', 'city' => 'Arequipa', 'is_active' => true],
            ['name' => 'Trujillo Office', 'address' => 'Av. España 200', 'city' => 'Trujillo', 'is_active' => false],
        ])->map(fn (array $payload) => Place::firstOrCreate(['name' => $payload['name']], $payload));

        $placeAreaMap = [
            'Lima HQ' => ['Technology', 'Marketing', 'Sales', 'Operations', 'Finance', 'Human Resources'],
            'Arequipa Office' => ['Technology', 'Marketing', 'Operations'],
            'Trujillo Office' => ['Sales', 'Operations'],
        ];

        foreach ($placeAreaMap as $placeName => $areaNames) {
            $place = $places->firstWhere('name', $placeName);
            if (! $place) {
                continue;
            }

            $place->areas()->sync(
                collect($areaNames)
                    ->map(fn (string $areaName) => $areas[$areaName]->id)
                    ->values()
                    ->all()
            );
        }

        $offers = [
            [
                'title' => 'Backend Developer Laravel',
                'description' => 'Develop and maintain APIs and core backend modules for the jobs platform.',
                'requirements' => ['3+ years with Laravel', 'Strong SQL knowledge', 'Git and CI/CD experience'],
                'benefits' => ['Private health insurance', 'Hybrid work', 'Training budget'],
                'modality' => JobModality::HYBRID,
                'vacancies' => 2,
                'area' => 'Technology',
                'place' => 'Lima HQ',
                'is_active' => true,
            ],
            [
                'title' => 'UX/UI Designer',
                'description' => 'Design user-centered interfaces for B2C and B2B products.',
                'requirements' => ['Figma advanced', 'Design systems', 'Usability testing'],
                'benefits' => ['Flexible schedule', 'Remote work', 'Learning stipend'],
                'modality' => JobModality::REMOTE,
                'vacancies' => 1,
                'area' => 'Marketing',
                'place' => 'Arequipa Office',
                'is_active' => true,
            ],
            [
                'title' => 'Sales Executive',
                'description' => 'Manage and grow key B2B accounts in the north region.',
                'requirements' => ['B2B sales experience', 'CRM management', 'Negotiation skills'],
                'benefits' => ['Performance bonus', 'Transportation support', 'Career plan'],
                'modality' => JobModality::ON_SITE,
                'vacancies' => 3,
                'area' => 'Sales',
                'place' => 'Trujillo Office',
                'is_active' => false,
            ],
        ];

        foreach ($offers as $offer) {
            Job::updateOrCreate(
                ['slug' => Str::slug($offer['title'])],
                [
                    'title' => $offer['title'],
                    'description' => $offer['description'],
                    'requirements' => $offer['requirements'],
                    'benefits' => $offer['benefits'],
                    'modality' => $offer['modality'],
                    'vacancies' => $offer['vacancies'],
                    'is_active' => $offer['is_active'],
                    'area_id' => $areas[$offer['area']]->id,
                    'place_id' => $places->firstWhere('name', $offer['place'])->id,
                ]
            );
        }

        $jobForApplications = Job::query()->where('is_active', true)->first();

        if ($jobForApplications) {
            Application::factory()->count(8)->create([
                'job_id' => $jobForApplications->id,
            ]);
        }
    }
}
