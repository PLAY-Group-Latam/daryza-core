<?php

namespace App\Http\Api\v1\Requests\Orders;

use Illuminate\Foundation\Http\FormRequest;

class ValidateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'items' => ['required', 'array', 'min:1'],
            'items.*.variant_id' => ['required', 'exists:product_variants,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:999'],
            'coupon_code' => ['nullable', 'string', 'max:50'],

            'shipping_info' => ['nullable', 'array'],
            'shipping_info.department_id' => ['nullable', 'string', 'exists:departments,id'],
            'shipping_info.province_id' => ['nullable', 'string', 'exists:provinces,id'],
            'shipping_info.district_id' => ['nullable', 'string', 'exists:districts,id'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('shipping_info')) {
            return;
        }

        if ($this->has('department_id') && $this->has('province_id') && $this->has('district_id')) {
            $this->merge([
                'shipping_info' => [
                    'department_id' => $this->input('department_id'),
                    'province_id' => $this->input('province_id'),
                    'district_id' => $this->input('district_id'),
                ],
            ]);
        }
    }
}
