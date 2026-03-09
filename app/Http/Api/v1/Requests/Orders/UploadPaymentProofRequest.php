<?php

namespace App\Http\Api\v1\Requests\Orders;

use Illuminate\Foundation\Http\FormRequest;

class UploadPaymentProofRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'voucher_file' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:6144'],
        ];
    }
}
