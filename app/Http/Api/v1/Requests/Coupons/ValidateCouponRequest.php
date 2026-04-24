<?php

namespace App\Http\Api\v1\Requests\Coupons;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class ValidateCouponRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'coupon_code' => ['required', 'string', 'max:50'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.type' => ['nullable', 'in:product,pack'],
            'items.*.item_id' => ['nullable', 'string'],
            'items.*.variant_id' => ['nullable', 'exists:product_variants,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:999'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $items = collect($this->input('items', []))
            ->map(function ($item) {
                if (!is_array($item)) {
                    return $item;
                }

                $type = (string) ($item['type'] ?? 'product');
                $itemId = trim((string) ($item['item_id'] ?? ''));
                $variantId = trim((string) ($item['variant_id'] ?? ''));

                if ($type !== 'pack' && $variantId === '' && $itemId !== '') {
                    $item['variant_id'] = $itemId;
                }

                return $item;
            })
            ->all();

        $this->merge(['items' => $items]);
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $items = $this->input('items', []);

            foreach ($items as $index => $item) {
                if (!is_array($item)) {
                    continue;
                }

                $type = (string) ($item['type'] ?? 'product');
                $hasVariantId = trim((string) ($item['variant_id'] ?? '')) !== '';

                if ($type !== 'pack' && !$hasVariantId) {
                    $validator->errors()->add("items.{$index}.variant_id", 'El variant_id es obligatorio para validar cupones en items de tipo product.');
                }
            }
        });
    }
}
