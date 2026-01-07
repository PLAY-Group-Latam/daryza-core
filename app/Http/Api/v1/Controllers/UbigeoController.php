<?php

namespace App\Http\Api\v1\Controllers;

use App\Models\Ubigeos\Department;
use App\Models\Ubigeos\Province;

class UbigeoController extends Controller
{
  // 1️⃣ Departamentos
  public function departments()
  {
    $departments = Department::select('id', 'name')
      ->orderBy('name')
      ->get();

    return $this->success('Departamentos cargados', $departments);
  }

  // 2️⃣ Provincias por departamento
  public function provinces(string $departmentId)
  {
    $provinces = Department::findOrFail($departmentId)
      ->provinces()
      ->select('id', 'name')
      ->orderBy('name')
      ->get();

    return $this->success('Provincias cargadas', $provinces);
  }

  // 3️⃣ Distritos por provincia
  public function districts(string $provinceId)
  {
    $districts = Province::findOrFail($provinceId)
      ->districts()
      ->select('id', 'name')
      ->orderBy('name')
      ->get();

    return $this->success('Distritos cargados', $districts);
  }
}
