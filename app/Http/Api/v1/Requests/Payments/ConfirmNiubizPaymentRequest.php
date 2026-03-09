<?php

namespace App\Http\Api\v1\Requests\Payments;

use Illuminate\Foundation\Http\FormRequest;

class ConfirmNiubizPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'purchase_number' => ['required', 'string', 'max:40'],
        ];
    }
}
