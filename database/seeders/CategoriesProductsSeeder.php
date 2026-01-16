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

    $orderParent = 1;

foreach ($categories as $parentName => $children) {

    $parentSlug = Str::slug($parentName);

    $parent = ProductCategory::create([
        'name'      => $parentName,
        'slug'      => $parentSlug,
        'parent_id' => null,
        'order'     => $orderParent++,
        'is_active' => true,
    ]);

    $orderChild = 1;

    foreach ($children as $childName) {

        $childSlug = $parentSlug . '-' . Str::slug($childName);

        ProductCategory::create([
            'name'      => $childName,
            'slug'      => $childSlug,
            'parent_id' => $parent->id,
            'order'     => $orderChild++,
            'is_active' => true,
        ]);
    }
}

}

}
