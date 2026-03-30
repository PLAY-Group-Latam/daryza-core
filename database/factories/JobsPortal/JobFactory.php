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
    protected static int $sequence = 0;

    public function definition(): array
    {
        $index = ++static::$sequence;
        $titles = [
            'Asesor Comercial',
            'Coordinador Logistico',
            'Analista de Marketing',
            'Supervisor de Operaciones',
            'Asistente Administrativo',
        ];
        $modalities = JobModality::cases();
        $title = $titles[($index - 1) % count($titles)] . " {$index}";
        $area = Area::factory()->create();
        $place = Place::factory()->create();
        $place->areas()->syncWithoutDetaching([$area->id]);

        return [
            'title' => $title,
            'slug' => Str::slug($title) . '-' . Str::lower(Str::random(6)),
            'description' => "Descripcion del puesto {$title}. Se valoran habilidades tecnicas y trabajo en equipo.",
            'requirements' => [
                "Experiencia minima de {$index} ano(s) en el rubro.",
                'Disponibilidad para trabajo presencial o hibrido.',
            ],
            'benefits' => [
                'Planilla desde el primer dia.',
                'Capacitaciones y linea de carrera.',
            ],
            'modality' => $modalities[($index - 1) % count($modalities)],
            'vacancies' => (($index - 1) % 10) + 1,
            'is_active' => true,
            'area_id' => $area->id,
            'place_id' => $place->id,
        ];
    }
}
