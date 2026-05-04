<?php

namespace Database\Seeders;

use App\Models\Settings\DeliverySetting;
use App\Models\Settings\DeliveryZone;
use App\Models\Ubigeos\Department;
use Illuminate\Database\Seeder;

class DeliveryLimaOnlySeeder extends Seeder
{
    public function run(): void
    {
        $limaDepartment = Department::query()
            ->whereRaw('LOWER(name) = ?', ['lima'])
            ->firstOrFail();

        // Base inicial: solo Lima con precio de delivery configurado.
        DeliveryZone::query()->delete();

        DeliveryZone::query()->create([
            'zone_type' => 'department',
            'zone_id' => $limaDepartment->id,
            'is_main' => true,
            'delivery_cost' => 10.00,
        ]);

        DeliverySetting::query()->updateOrCreate(
            [],
            [
                'minimum_order_amount' => 100.00,
                'order_amount_threshold' => 50.00,
            ]
        );
    }
}

