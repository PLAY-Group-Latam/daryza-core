<?php

namespace Database\Seeders;

use App\Models\Settings\DeliveryZone;
use App\Models\Ubigeos\District;
use App\Models\Ubigeos\Province;
use Illuminate\Database\Seeder;

class DeliveryZoneDaryzaSeeder extends Seeder
{
    public function run(): void
    {
        $limaProvince = Province::where('ubigeo_id', '3927')->first();

        if (!$limaProvince) {
            $this->command->error("No se encontró la Provincia de Lima (ubigeo_id: 3927). Abortando.");
            return;
        }

        $districtsData = [
            'Ancón'                    => 18.00,
            'Ate'                      => 17.00,
            'Barranco'                 => 14.00,
            'Breña'                    => 16.00,
            'Carabayllo'               => 18.00,
            'Cercado de Lima'          => 16.00,
            'Chaclacayo'               => 18.00,
            'Chorrillos'               => 14.00,
            'Cieneguilla'              => 18.00,
            'Comas'                    => 18.00,
            'El Agustino'              => 17.00,
            'Independencia'            => 18.00,
            'Jesús María'              => 16.00,
            'La Molina'                => 15.00,
            'La Victoria'              => 16.00,
            'Lince'                    => 16.00,
            'Los Olivos'               => 18.00,
            'Lurigancho'               => 18.00,
            'Lurín'                    => 12.00,
            'Magdalena del Mar'        => 16.00,
            'Miraflores'               => 15.00,
            'Pachacámac'               => 12.00,
            'Pucusana'                 => 18.00,
            'Pueblo Libre'             => 16.00,
            'Puente Piedra'            => 18.00,
            'Punta Hermosa'            => 12.00,
            'Punta Negra'              => 13.00,
            'Rímac'                    => 16.00,
            'San Bartolo'              => 13.00,
            'San Borja'                => 15.00,
            'San Isidro'               => 16.00,
            'San Juan de Lurigancho'   => 18.00,
            'San Juan de Miraflores'   => 13.00,
            'San Luis'                 => 17.00,
            'San Martín de Porres'     => 18.00,
            'San Miguel'               => 16.00,
            'Santa Anita'              => 17.00,
            'Santa María del Mar'      => 18.00,
            'Santa Rosa'               => 18.00,
            'Santiago de Surco'        => 14.00,
            'Surquillo'                => 14.00,
            'Villa El Salvador'        => 12.00,
            'Villa María del Triunfo'  => 13.00,
        ];

        foreach ($districtsData as $districtName => $cost) {
            $district = District::where('province_id', $limaProvince->id)
                ->where('name', $districtName)
                ->first();

            // fallback: busca sin tildes por si la DB no tiene tildes
            if (!$district) {
                $normalized = $this->removeDiacritics($districtName);
                $district = District::where('province_id', $limaProvince->id)
                    ->whereRaw('LOWER(name) = ?', [strtolower($normalized)])
                    ->first();
            }

            if ($district) {
                DeliveryZone::updateOrCreate(
                    [
                        'zone_type' => 'district',
                        'zone_id'   => $district->id,
                    ],
                    [
                        'is_main'       => false,
                        'delivery_cost' => $cost,
                    ]
                );
                $this->command->info("✓ {$districtName}: S/ {$cost}");
            } else {
                $this->command->warn("✗ No encontrado: {$districtName}");
            }
        }

        $this->command->info('Seeder completado.');
    }

    private function removeDiacritics(string $text): string
    {
        $from = ['á','é','í','ó','ú','Á','É','Í','Ó','Ú','ñ','Ñ'];
        $to   = ['a','e','i','o','u','A','E','I','O','U','n','N'];
        return str_replace($from, $to, $text);
    }
}