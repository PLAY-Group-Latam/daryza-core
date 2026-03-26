<?php

namespace App\Http\Api\v1\Controllers;

use App\Models\Settings\DeliveryZone;
use App\Models\Ubigeos\Department;
use App\Models\Ubigeos\District;
use App\Models\Ubigeos\Province;

class UbigeoController extends Controller
{

  public function departments()
  {
    $departments = Department::select('id', 'name')
      ->orderBy('name')
      ->get();

    return $this->success('Departamentos cargados', $departments);
  }

  public function provinces(string $departmentId)
  {
    $provinces = Department::findOrFail($departmentId)
      ->provinces()
      ->select('id', 'name')
      ->orderBy('name')
      ->get();

    return $this->success('Provincias cargadas', $provinces);
  }

  public function districts(string $provinceId)
  {
    $districts = Province::findOrFail($provinceId)
      ->districts()
      ->select('id', 'name')
      ->orderBy('name')
      ->get();

    return $this->success('Distritos cargados', $districts);
  }

  public function checkoutDepartments()
  {
    $zoneIds = $this->zoneIdsByType();

    $departments = Department::query()
      ->select('id', 'name')
      ->where(function ($query) use ($zoneIds) {
        $query->whereIn('id', $zoneIds['department'])
          ->orWhereHas('provinces', function ($provinceQuery) use ($zoneIds) {
            $provinceQuery->whereIn('id', $zoneIds['province'])
              ->orWhereHas('districts', fn($districtQuery) => $districtQuery->whereIn('id', $zoneIds['district']));
          });
      })
      ->orderBy('name')
      ->get();

    return $this->success('Departamentos con cobertura de delivery cargados', $departments);
  }

  public function checkoutProvinces(string $departmentId)
  {
    $department = Department::query()->findOrFail($departmentId);
    $zoneIds = $this->zoneIdsByType();

    $departmentHasCoverage = in_array($department->id, $zoneIds['department'], true);

    $provincesQuery = $department->provinces()
      ->select('id', 'name')
      ->orderBy('name');

    if (!$departmentHasCoverage) {
      $provincesQuery->where(function ($query) use ($zoneIds) {
        $query->whereIn('id', $zoneIds['province'])
          ->orWhereHas('districts', fn($districtQuery) => $districtQuery->whereIn('id', $zoneIds['district']));
      });
    }

    $provinces = $provincesQuery->get();

    return $this->success('Provincias con cobertura de delivery cargadas', $provinces);
  }

  public function checkoutDistricts(string $provinceId)
  {
    $province = Province::query()->findOrFail($provinceId);
    $zoneIds = $this->zoneIdsByType();

    $provinceHasCoverage = in_array($province->id, $zoneIds['province'], true);
    $departmentHasCoverage = in_array($province->department_id, $zoneIds['department'], true);

    $districtsQuery = District::query()
      ->where('province_id', $province->id)
      ->select('id', 'name')
      ->orderBy('name');

    if (!$provinceHasCoverage && !$departmentHasCoverage) {
      $districtsQuery->whereIn('id', $zoneIds['district']);
    }

    $districts = $districtsQuery->get();

    return $this->success('Distritos con cobertura de delivery cargados', $districts);
  }

  private function zoneIdsByType(): array
  {
    return [
      'department' => DeliveryZone::query()
        ->where('zone_type', 'department')
        ->where('delivery_cost', '>', 0)
        ->pluck('zone_id')
        ->all(),
      'province' => DeliveryZone::query()
        ->where('zone_type', 'province')
        ->where('delivery_cost', '>', 0)
        ->pluck('zone_id')
        ->all(),
      'district' => DeliveryZone::query()
        ->where('zone_type', 'district')
        ->where('delivery_cost', '>', 0)
        ->pluck('zone_id')
        ->all(),
    ];
  }
}
