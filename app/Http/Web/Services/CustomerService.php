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

    /**
     * Actualizar un cliente junto con sus relaciones.
     */
    public function update(Customer $customer, array $data): Customer
    {
        return DB::transaction(function () use ($customer, $data) {

            if (!empty($data['password'])) {
                $data['password'] = Hash::make($data['password']);
            } else {
                unset($data['password']);
            }

            // Actualizar cliente
            $customer->update($data);

            // Actualizar billing profiles si vienen
            if (isset($data['billing_profiles']) && is_array($data['billing_profiles'])) {
                // Aquí podrías hacer lógica de sync o actualizar individualmente
                foreach ($data['billing_profiles'] as $profileData) {
                    if (!empty($profileData['id'])) {
                        $customer->billingProfiles()->find($profileData['id'])?->update($profileData);
                    } else {
                        $customer->billingProfiles()->create($profileData);
                    }
                }
            }

            // Actualizar addresses si vienen
            if (isset($data['addresses']) && is_array($data['addresses'])) {
                foreach ($data['addresses'] as $addressData) {
                    if (!empty($addressData['id'])) {
                        $customer->addresses()->find($addressData['id'])?->update($addressData);
                    } else {
                        $customer->addresses()->create($addressData);
                    }
                }
            }

            return $customer;
        });
    }

    /**
     * Eliminar un cliente (soft delete).
     */
    public function delete(Customer $customer): void
    {
        DB::transaction(function () use ($customer) {
            $customer->delete();
        });
    }
}
