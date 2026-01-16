<?php

namespace App\Http\Web\Services\Delivery;

use App\Models\DeliveryZone;
use App\Models\Department;



class DeliveryService
{
    public function getTreeUbigeos()
    {
        $zones = DeliveryZone::get()->keyBy(fn($z) => $z->zone_type . '_' . $z->zone_id);
        $departments = Department::with(['provinces.districts'])->orderBy('name')->get();
        foreach ($departments as $department) {
            $zoneKey = 'department_' . $department->id;
            $department->delivery_zone = $zones[$zoneKey] ?? null;

            foreach ($department->provinces as $province) {
                $zoneKey = 'province_' . $province->id;
                $province->delivery_zone = $zones[$zoneKey] ?? null;

                foreach ($province->districts as $district) {
                    $zoneKey = 'district_' . $district->id;
                    $district->delivery_zone = $zones[$zoneKey] ?? null;
                }
            }
        }
        return $departments;
    }
}

