<?php

namespace App\Http\Api\v1\Requests\Cart;

use Illuminate\Foundation\Http\FormRequest;

class AddCartItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth('api')->check();
    }

    public function rules(): array
    {
        return [
            'item_id' => ['required', 'string'],
            'type' => ['required', 'in:product,pack'],
            'quantity' => ['nullable', 'integer', 'min:1', 'max:999'],
        ];
    }
}

