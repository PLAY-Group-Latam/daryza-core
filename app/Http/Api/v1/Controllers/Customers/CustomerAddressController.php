<?php

namespace App\Http\Api\v1\Controllers\Customers;

use App\Http\Api\v1\Controllers\Controller;
use App\Models\Customers\Customer;
use Illuminate\Http\Request;

class CustomerAddressController extends Controller
{
    public function store(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'address'       => 'required|string|max:255',
            'department_id' => 'required|exists:departments,id',
            'province_id'   => 'required|exists:provinces,id',
            'district_id'   => 'required|exists:districts,id',
            'country'       => 'string|nullable',
            'postal_code'   => 'string|nullable',
            'reference'     => 'string|nullable',
        ]);

    $address = $customer->addresses()->updateOrCreate(
        ['customer_id' => $customer->id], // Condición de búsqueda
        $validated // Campos a actualizar o crear
    );
        return $this->success(
            'Dirección guardada correctamente',
            $address
        );
    }

    public function index(Customer $customer)
    {
        // Trae solo la última dirección del cliente
        $address = $customer->addresses()->latest()->first();

        if (!$address) {
            return $this->success('No se encontró ninguna dirección', null);
        }

        return $this->success('Dirección obtenida', $address);
    }
}
