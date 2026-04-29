<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use App\Models\Products\ProductCategory;

class CategoriesProductsSeeder extends Seeder
{
    public function run(): void
    {
        
        DB::transaction(function () {
            
           
            DB::statement('TRUNCATE TABLE product_categories RESTART IDENTITY CASCADE;');

            $categories = [
                'Accesorios de Limpieza' => [
                    'Implementos', 'Paños', 'Tapete Urinario', 'Trapeadores', 'Baldes Exprimidores', 
                    'Bolsas para basura', 'Contenedores', 'Escobas', 'Esponjas', 'Guantes', 
                    'Hisopos para WC', 'Mascarillas', 'Pad', 'Pads', 'Pulverizadores', 'Recogedores'
                ],
                'Dispensadores' => [
                    'Jabones', 'Papel higiénico', 'Papel toalla', 'Servilletas'
                ],
                'Papeles' => [
                    'Servilletas', 'Pañuelos faciales', 'Papel higiénico', 'Papel toalla'
                ],
                'Químicos de Limpieza' => [
                    'Alcoholes', 'Ceras', 'Cloro', 'Desatoradores', 'Desengrasantes', 'Desinfectantes', 
                    'Gel para manos', 'Jabones', 'Lavavajillas', 'Lejías', 'Limpiador de fragua', 
                    'Limpiador de superficies', 'Limpia Todos', 'Limpiavidrios', 'Pastillas', 
                    'Perfumadores', 'Removedores', 'Shampoos', 'Suavizantes', 'Virucidas'
                ],
            ];

            foreach ($categories as $parentName => $children) {
           
                $parent = ProductCategory::create([
                    'name'      => $parentName,
                    'slug'      => Str::slug($parentName),
                    'is_active' => true,
                ]);

               
                foreach (array_unique($children) as $childName) {
                    ProductCategory::create([
                        'name'      => $childName,
                        'slug'      => Str::slug($parentName . '-' . $childName),
                        'parent_id' => $parent->id,
                        'is_active' => true, 
                    ]);
                }
            }
        });
    }
}