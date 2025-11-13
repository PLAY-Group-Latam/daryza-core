<?php

namespace App\Http\Web\Requests\Customers;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Ajusta según permisos
    }

    public function rules(): array
    {
        $customerId = $this->route('customer')->id;

        return [
            // Datos del cliente
            'full_name' => ['required', 'string', 'max:255'],
            'email'     => [
                'required',
                'email',
                Rule::unique('customers', 'email')->ignore($customerId),
            ],
            'phone'     => [
                'nullable',
                'string',
                Rule::unique('customers', 'phone')->ignore($customerId),
            ],
            'password'  => ['nullable', 'string', 'min:6'],
            'google_id' => ['nullable', 'string'],
            'photo'     => ['nullable', 'string'],
            'dni'       => [
                'nullable',
                'string',
                'size:8',
                Rule::unique('customers', 'dni')->ignore($customerId),
            ],

            // Billing Profiles
            'billing_profiles'             => ['nullable', 'array'],
            'billing_profiles.*.id'        => ['nullable', 'string', 'exists:billing_profiles,id'],
            'billing_profiles.*.ruc'       => ['required_with:billing_profiles', 'string', 'size:11'],
            'billing_profiles.*.social_reason' => ['required_with:billing_profiles', 'string', 'max:255'],

            // Addresses
            'addresses'                   => ['nullable', 'array'],
            'addresses.*.id'              => ['nullable', 'string', 'exists:addresses,id'],
            'addresses.*.address'         => ['required_with:addresses', 'string', 'max:255'],
            'addresses.*.department_id'   => ['required_with:addresses', 'exists:departments,id'],
            'addresses.*.province_id'     => ['required_with:addresses', 'exists:provinces,id'],
            'addresses.*.district_id'     => ['required_with:addresses', 'exists:districts,id'],
            'addresses.*.country'         => ['nullable', 'string', 'size:3'],
            'addresses.*.postal_code'     => ['nullable', 'string', 'max:10'],
            'addresses.*.reference'       => ['nullable', 'string', 'max:255'],
        ];
    }

    public function prepareForValidation()
    {
        if ($this->has('email')) {
            $this->merge(['email' => strtolower(trim($this->email))]);
        }
    }
}
