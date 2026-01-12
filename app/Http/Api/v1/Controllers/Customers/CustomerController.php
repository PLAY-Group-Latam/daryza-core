<?php

namespace App\Http\Api\v1\Controllers\Customers;

use App\Http\Api\v1\Controllers\Controller;
use App\Http\Api\v1\Requests\Customers\UpdateCustomerRequest;
use App\Models\Customers\Customer;


class CustomerController extends Controller
{
  /**
   * Actualiza los datos del usuario logueado
   */
  public function update(UpdateCustomerRequest $request)
  {
    $customer = Customer::findOrFail(auth('api')->id());

    $data = $request->validated();

    // Log::info('Datos recibidos en updateCustomer:', $data);

    $customer->update([
      'full_name' => $data['full_name'],
      'email' => $data['email'],
      'dni' => $data['dni'],
      'phone' => $data['phone'],
    ]);

    if (!empty($data['is_company'])) {
      $customer->billingProfile()->updateOrCreate(
        ['customer_id' => $customer->id],
        [
          'ruc' => $data['ruc'],
          'social_reason' => $data['social_reason'],
        ]
      );
    }
    
    return $this->success('Datos actualizados correctamente', $customer);
  }
}
