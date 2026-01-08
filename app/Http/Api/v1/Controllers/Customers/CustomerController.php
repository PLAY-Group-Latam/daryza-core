<?php

namespace App\Http\Api\v1\Controllers\Customers;

use App\Http\Api\v1\Controllers\Controller;

use Illuminate\Http\Request;

class CustomerController extends Controller
{
  /**
   * Actualiza los datos del usuario logueado
   */
  public function update(Request $request)
  {
    $customer = auth('api')->user();

    // Validación básica
    $data = $request->validate([
      'full_name' => 'required|string|max:255',
      'email' => 'required|email',
      'dni' => 'required|string|size:8',
      'phone' => 'required|string|size:9',
      'is_company' => 'boolean',
      'ruc' => 'nullable|string|size:11',
      'social_reason' => 'nullable|string|max:255',
    ]);

    // 1️⃣ Actualizar datos personales
    $customer->update([
      'full_name' => $data['full_name'],
      'email' => $data['email'],
      'dni' => $data['dni'],
      'phone' => $data['phone'],
    ]);

    // 2️⃣ Si es empresa, crear o actualizar billing_profile
    if (!empty($data['is_company'])) {
      $customer->billingProfile()->updateOrCreate(
        [
          'ruc' => $data['ruc'],
          'social_reason' => $data['social_reason'],
        ]
      );
    } 

    return $this->success('Datos actualizados correctamente', [
      $customer->load('billingProfile')
    ]);
  }
}
