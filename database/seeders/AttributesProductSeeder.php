<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Products\Attribute;
use App\Models\Products\AttributesValue;
use App\Enums\AttributeType; 

class AttributesProductSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            
            DB::statement('TRUNCATE TABLE product_variant_attribute_values RESTART IDENTITY CASCADE;');
            DB::statement('TRUNCATE TABLE attributes_values RESTART IDENTITY CASCADE;');
            DB::statement('TRUNCATE TABLE attributes RESTART IDENTITY CASCADE;');

            $attributesData = [
                'Color' => [
                    '#FFFF00', '#0000FF', '#FFFFFF', '#808080', '#A52A2A', 
                    '#FFA500', '#eedc82', '#000000', '#FF0000', '#008000'
                ],
                'Presentación' => [
                    '1 kilo', '1.5 litros', '1000 ml', '15 kilos', '19 litros', '2 litros', 
                    '270 ml', '3.8 litros', '360 ml', '4 litros', '400 gr', '400 ml', 
                    '5 litros', '500 ml', '650 ml', '800 gr', '9 kilos', '900 ml', 
                    'Caja x 18', 'Caja x 24', 'Caja x 45', 'Caja x 5', 'Caja x 6', 
                    'Caja x 9', 'Paquete', 'Paquete x 10', 'Paquete x 12', 'Paquete x 15', 
                    'Paquete x 20', 'Paquete x 3', 'Paquete x 4', 'Paquete x 6', 'Unidad'
                ],
                'Aroma' => [
                    'Antitabaco', 'Bebé', 'Bouquette', 'Brisa', 'Cherry', 'Cítrico', 
                    'Floral', 'Fresa', 'Frutal', 'Frutos rojos', 'Jardín de rosas', 
                    'Lavanda', 'Limón', 'Manzana', 'Neutro', 'Pino', 'Potpurrí', 'Primavera'
                ],
                'Talla' => [
                    '7', '8', '9', 'S', 'M', 'L'
                ]
            ];

            foreach ($attributesData as $attrName => $values) {
                
                $attribute = Attribute::create([
                    'name'          => $attrName,
                    'type'          => AttributeType::SELECT,
                    'is_filterable' => true,
                    'is_variant'    => true,
                ]);

                foreach (array_unique($values) as $val) {
                    AttributesValue::create([
                        'attribute_id' => $attribute->id,
                        'value'        => $val,
                    ]);
                }
            }
        });
    }
}