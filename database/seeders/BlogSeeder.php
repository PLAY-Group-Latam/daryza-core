<?php

namespace Database\Seeders;

use App\Models\Blogs\Blog;
use App\Models\Blogs\BlogCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BlogSeeder extends Seeder
{
    public function run(): void
    {
        $categories = collect([
            'Tecnología',
            'Transformación Digital',
            'Recursos Humanos',
            'Cultura Organizacional',
            'Innovación',
        ])->mapWithKeys(fn (string $name) => [
            $name => BlogCategory::query()->firstOrCreate(['name' => $name]),
        ]);

        $posts = [
            [
                'title' => 'Cómo escalar un equipo de desarrollo sin perder calidad',
                'description' => 'Buenas prácticas para crecer equipos de ingeniería manteniendo velocidad y calidad de entrega.',
                'content' => '<p>Escalar un equipo requiere estándares, procesos claros y liderazgo técnico.</p><p>Este artículo resume una guía práctica para crecer sin comprometer la calidad del producto.</p>',
                'author' => 'Equipo Daryza',
                'visibility' => true,
                'publication_date' => now()->subDays(12)->toDateString(),
                'categories' => ['Tecnología', 'Innovación'],
            ],
            [
                'title' => 'Reclutamiento técnico: claves para contratar mejor en 2026',
                'description' => 'Estrategias de atracción y evaluación para perfiles de alto impacto en áreas tecnológicas.',
                'content' => '<p>El reclutamiento técnico debe enfocarse en evidencia práctica, no solo CV.</p><p>Exploramos entrevistas estructuradas, pruebas realistas y métricas de calidad de contratación.</p>',
                'author' => 'Talento Daryza',
                'visibility' => true,
                'publication_date' => now()->subDays(9)->toDateString(),
                'categories' => ['Recursos Humanos', 'Tecnología'],
            ],
            [
                'title' => 'Modelo híbrido: cómo mejorar productividad y bienestar',
                'description' => 'Recomendaciones para equipos híbridos con foco en resultados y experiencia del colaborador.',
                'content' => '<p>El trabajo híbrido funciona cuando existen reglas explícitas y objetivos medibles.</p><p>Compartimos un marco simple para diseñar rituales, comunicación y evaluación de desempeño.</p>',
                'author' => 'People & Culture',
                'visibility' => true,
                'publication_date' => now()->subDays(6)->toDateString(),
                'categories' => ['Cultura Organizacional', 'Recursos Humanos'],
            ],
            [
                'title' => 'Automatización de procesos internos para equipos administrativos',
                'description' => 'Casos prácticos para reducir tareas repetitivas y elevar eficiencia operativa.',
                'content' => '<p>Automatizar procesos administrativos libera tiempo para decisiones estratégicas.</p><p>Revisamos herramientas, priorización de procesos y métricas de impacto.</p>',
                'author' => 'Operaciones Daryza',
                'visibility' => true,
                'publication_date' => now()->subDays(3)->toDateString(),
                'categories' => ['Transformación Digital', 'Innovación'],
            ],
        ];

        foreach ($posts as $post) {
            $base = Blog::factory()->make()->toArray();

            $blog = Blog::query()->updateOrCreate(
                ['slug' => Str::slug($post['title'])],
                array_merge($base, [
                    'title' => $post['title'],
                    'slug' => Str::slug($post['title']),
                    'description' => $post['description'],
                    'content' => $post['content'],
                    'author' => $post['author'],
                    'visibility' => $post['visibility'],
                    'publication_date' => $post['publication_date'],
                    'image' => null,
                    'miniature' => null,
                ])
            );

            $categoryIds = collect($post['categories'])
                ->map(fn (string $name) => $categories[$name]?->id)
                ->filter()
                ->values()
                ->all();

            if ($categoryIds !== []) {
                $blog->categories()->syncWithoutDetaching($categoryIds);
            }
        }
    }
}
