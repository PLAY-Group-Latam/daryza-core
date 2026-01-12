<?php

namespace App\Http\Web\Services;

use App\Models\Customers\Customer;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Exception;

class CustomerService
{
    /**
     * Crear un cliente junto con sus perfiles de facturación y direcciones.
     */
    public function create(array $data): Customer
    {
        // Hash de password si viene en los datos
        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        // Crear y retornar el cliente
        return Customer::create($data);
    }

    public function updatePassword(string $id, string $newPassword): Customer
    {
        $customer = Customer::findOrFail($id);

        $customer->update([
            'password' => Hash::make($newPassword),
        ]);

        return $customer;
    }

   
}
