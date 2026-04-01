<?php

namespace Database\Seeders;

use App\Models\Landings\Landing;
use App\Models\Metadata;
use Illuminate\Database\Seeder;

class LandingSeeder extends Seeder
{
    public function run(): void
    {
        $landing = Landing::query()->updateOrCreate(
            ['slug' => 'detergente-industrial-pro'],
            [
                'title' => 'Landing Detergente Industrial Pro',
                'is_active' => true,
                'sections' => [
                    'brandStory' => [
                        'title' => 'Limpieza profesional para alto rendimiento',
                        'subtitle' => 'Formula concentrada',
                        'description' => 'Desarrollado para plantas, almacenes y operaciones de alto tránsito con resultados consistentes.',
                        'media' => [
                            'type' => 'image',
                            'src_desktop' => null,
                            'src_mobile' => null,
                            'src_video' => null,
                        ],
                    ],
                    'features' => [
                        'title' => 'Características ',
                        'items' => [
                            [
                                'title' => 'Alto poder desengrasante',
                                'description' => 'Remueve suciedad pesada en menos tiempo y con menor esfuerzo.',
                                'image' => '',
                            ],
                            [
                                'title' => 'Rendimiento por litro',
                                'description' => 'Mayor cobertura por aplicación para optimizar costos operativos.',
                                'image' => '',
                            ],
                        ],
                    ],
                    'knowMore' => [
                        'title' => 'Conoce más',
                        'items' => [
                            [
                                'id' => 'km-1',
                                'title' => 'Ficha técnica',
                                'description' => 'Revisa composición, modo de uso y recomendaciones de seguridad.',
                                'image' => '',
                            ],
                            [
                                'id' => 'km-2',
                                'title' => 'Casos de uso',
                                'description' => 'Ejemplos reales de implementación por industria.',
                                'image' => '',
                            ],
                        ],
                    ],
                ],
            ]
        );

        Metadata::query()->updateOrCreate(
            [
                'metadatable_id' => (string) $landing->id,
                'metadatable_type' => Landing::class,
            ],
            [
                'meta_title' => 'Detergente Industrial Pro | Landing Campaña',
                'meta_description' => 'Optimiza tu operación con limpieza industrial de alto rendimiento.',
                'meta_keywords' => 'detergente industrial, limpieza profesional, planta industrial',
                'og_title' => 'Detergente Industrial Pro',
                'og_description' => 'Solución profesional para limpieza de alto tránsito.',
                'og_image' => null,
                'og_type' => 'website',
                'canonical_url' => rtrim((string) config('app.frontend_url'), '/') . '/landing/producto/' . $landing->slug,
                'noindex' => false,
                'nofollow' => false,
            ]
        );
    }
}
