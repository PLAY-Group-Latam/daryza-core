<?php

namespace Database\Seeders;

use App\Models\Landings\Landing;
use App\Models\Landings\LandingLead;
use Illuminate\Database\Seeder;

class LandingLeadSeeder extends Seeder
{
    public function run(): void
    {
        $landing = Landing::query()
            ->where('slug', 'detergente-industrial-pro')
            ->first();

        if (!$landing) {
            return;
        }

        $rows = [
            [
                'full_name' => 'Carlos Mendoza',
                'email' => 'carlos.mendoza@example.com',
                'phone' => '999123456',
                'form_key' => 'advisor_form',
                'data' => [
                    'ruc_or_dni' => '20123456789',
                    'company_name' => 'Distribuciones Mendoza SAC',
                    'comments' => 'Necesito cotización para 3 sedes.',
                ],
                'source_data' => [
                    'utm_source' => 'google',
                    'utm_medium' => 'cpc',
                    'utm_campaign' => 'q2_2026_detergente',
                ],
                'page_url' => rtrim((string) config('app.frontend_url'), '/') . '/landing/producto/' . $landing->slug,
                'referrer' => 'https://www.google.com/',
                'ip_address' => '190.12.10.15',
                'user_agent' => 'Seeder Demo Agent',
            ],
            [
                'full_name' => 'Andrea Ruiz',
                'email' => 'andrea.ruiz@example.com',
                'phone' => '987654321',
                'form_key' => 'advisor_form',
                'data' => [
                    'ruc_or_dni' => '10456789012',
                    'company_name' => 'Servicios Integrales Ruiz',
                    'comments' => 'Interesa demostración en planta.',
                ],
                'source_data' => [
                    'utm_source' => 'meta',
                    'utm_medium' => 'paid_social',
                    'utm_campaign' => 'q2_2026_detergente',
                ],
                'page_url' => rtrim((string) config('app.frontend_url'), '/') . '/landing/producto/' . $landing->slug,
                'referrer' => 'https://www.facebook.com/',
                'ip_address' => '181.44.20.9',
                'user_agent' => 'Seeder Demo Agent',
            ],
            [
                'full_name' => 'Luis Paredes',
                'email' => 'luis.paredes@example.com',
                'phone' => '956321478',
                'form_key' => 'advisor_form',
                'data' => [
                    'ruc_or_dni' => '20654321987',
                    'company_name' => 'Paredes Operaciones EIRL',
                    'comments' => 'Consulta por volumen mensual > 1000 litros.',
                ],
                'source_data' => [
                    'utm_source' => 'linkedin',
                    'utm_medium' => 'cpc',
                    'utm_campaign' => 'q2_2026_detergente',
                ],
                'page_url' => rtrim((string) config('app.frontend_url'), '/') . '/landing/producto/' . $landing->slug,
                'referrer' => 'https://www.linkedin.com/',
                'ip_address' => '170.85.14.22',
                'user_agent' => 'Seeder Demo Agent',
            ],
        ];

        foreach ($rows as $row) {
            LandingLead::query()->updateOrCreate(
                [
                    'landing_id' => $landing->id,
                    'email' => $row['email'],
                ],
                $row + ['landing_id' => $landing->id]
            );
        }
    }
}
