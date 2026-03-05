<?php

namespace App\Http\Web\Services\Delivery;

use App\Models\DeliveryZone;
use App\Models\Department;
use App\Models\DeliverySetting;
use Illuminate\Support\Facades\DB;

class DeliveryService
{
    public function getTreeUbigeos()
    {
        $zones = DeliveryZone::all()->keyBy(fn($z) => "{$z->zone_type}_{$z->zone_id}");

        $departments = Department::with(['provinces.districts'])
            ->orderBy('name')
            ->get();

        $departments->each(function ($dept) use ($zones) {
            $this->assignZone($dept, 'department', $zones);
            $dept->provinces->each(function ($prov) use ($zones) {
                $this->assignZone($prov, 'province', $zones);
                $prov->districts->each(function ($dist) use ($zones) {
                    $this->assignZone($dist, 'district', $zones);
                });
            });
        });

        return $departments;
    }

    public function upsertZone(array $data)
    {
        return DB::transaction(function () use ($data) {
            $isMain = $data['is_main'] ?? false;

            if ($isMain) {
                if ($data['zone_type'] !== 'district') {
                    throw new \InvalidArgumentException('Solo los distritos pueden ser marcados como sede principal.');
                }

                DeliveryZone::where('zone_type', 'district')
                    ->where('is_main', true)
                    ->update(['is_main' => false]);
            }

            return DeliveryZone::updateOrCreate(
                [
                    'zone_type' => $data['zone_type'],
                    'zone_id'   => $data['zone_id'],
                ],
                [
                    'delivery_cost' => $data['delivery_cost'],
                    'is_main'       => $isMain,
                ]
            );
        });
    }

  
    public function updateSettings(array $data)
    {
        if ($data['minimum_order_amount'] < $data['order_amount_threshold']) {
            throw new \InvalidArgumentException('El monto mínimo del pedido no puede ser menor que el umbral del monto del pedido.');
        }

        return DeliverySetting::updateOrCreate([], $data);
    }

    private function assignZone($model, string $type, $zones): void
    {
        $key = "{$type}_{$model->id}";
        $model->delivery_zone = $zones->get($key);
    }
}