<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\Products\ProductCategory;

class CategoriesProductsSeeder extends Seeder
{
    public function run(): void
    {
        ProductCategory::truncate();

        $categories = [
            'Accesorios de Limpieza' => [
                'Implementos',
                'Paños',
                'Tapete Urinario',
                'Trapeadores',
                'Baldes Exprimidores',
                'Bolsas para basura',
                'Contenedores',
                'Escobas',
                'Esponjas',
                'Guantes',
                'Hisopos para WC',
                'Mascarillas',
                'Pad',
                'Pads',
                'Pulverizadores',
                'Recogedores',
            ],

            'Dispensadores' => [
                'Jabones',
                'Papel higiénico',
                'Papel toalla',
                'Servilletas',
            ],

            'Papeles' => [
                'Servilletas',
                'Pañuelos faciales',
                'Papel higiénico',
                'Papel toalla',
            ],

            'Químicos de Limpieza' => [
                'Alcoholes',
                'Ceras',
                'Cloro',
                'Desatoradores',
                'Desengrasantes',
                'Desinfectantes',
                'Gel para manos',
                'Jabones',
                'Lavavajillas',
                'Lejías',
                'Limpiador de fragua',
                'Limpiador de superficies',
                'Limpia Todos',
                'Limpiavidrios',
                'Pastillas',
                'Perfumadores',
                'Removedores',
                'Shampoos',
                'Suavizantes',
                'Virucidas',
            ],

            'Packs' => [],
        ];


        foreach ($categories as $parentName => $children) {
            // Al no enviar 'order', el Observer lo calcula solo
            $parent = ProductCategory::create([
                'name' => $parentName,
                'slug' => Str::slug($parentName),
            ]);

            foreach ($children as $childName) {
                ProductCategory::create([
                    'name'      => $childName,
                    'slug'      => Str::slug($parentName . '-' . $childName),
                    'parent_id' => $parent->id,
                ]);
            }
        }
    }
}
