<?php

namespace Database\Seeders;

use App\Models\Ubigeos\Department;
use App\Models\Ubigeos\District;
use App\Models\Ubigeos\Province;
use Illuminate\Database\Seeder;

class UbigeoSeeder extends Seeder
{
    public function run(): void
    {
        $departments = json_decode(
            file_get_contents(database_path('data/ubigeos/departments.json')),
            true
        );

        $provinces = json_decode(
            file_get_contents(database_path('data/ubigeos/provinces.json')),
            true
        );

        $districts = json_decode(
            file_get_contents(database_path('data/ubigeos/districts.json')),
            true
        );

        foreach ($departments as $dep) {
            $department = Department::create([
                'ubigeo_id'  => $dep['id_ubigeo'],
                'name'       => $dep['nombre_ubigeo'],
                'iso_code'   => $dep['code_ISO_3166'],
                'label'      => $dep['etiqueta_ubigeo'],
                'searchable' => $dep['buscador_ubigeo'],
            ]);

            if (!isset($provinces[$dep['id_ubigeo']])) {
                continue;
            }

            foreach ($provinces[$dep['id_ubigeo']] as $prov) {
                $province = Province::create([
                    'ubigeo_id'     => $prov['id_ubigeo'],
                    'name'          => $prov['nombre_ubigeo'],
                    'label'         => $prov['etiqueta_ubigeo'],
                    'searchable'    => $prov['buscador_ubigeo'],
                    'department_id' => $department->id,
                ]);

                if (!isset($districts[$prov['id_ubigeo']])) {
                    continue;
                }

                foreach ($districts[$prov['id_ubigeo']] as $dist) {
                    District::create([
                        'ubigeo_id'  => $dist['id_ubigeo'],
                        'name'       => $dist['nombre_ubigeo'],
                        'label'      => $dist['etiqueta_ubigeo'],
                        'searchable' => $dist['buscador_ubigeo'],
                        'province_id'=> $province->id,
                    ]);
                }
            }
        }
    }
}
