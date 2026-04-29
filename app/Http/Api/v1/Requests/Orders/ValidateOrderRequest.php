<?php

namespace App\Http\Api\v1\Requests\Orders;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

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
            'items.*.type' => ['nullable', 'in:product,pack'],
            'items.*.item_id' => ['nullable', 'string'],
            'items.*.variant_id' => ['nullable', 'exists:product_variants,id'],
            'items.*.pack_id' => ['nullable', 'exists:product_packs,id'],
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
        $items = collect($this->input('items', []))
            ->map(function ($item) {
                if (!is_array($item)) {
                    return $item;
                }

                $type = (string) ($item['type'] ?? 'product');
                $itemId = trim((string) ($item['item_id'] ?? ''));
                $packId = trim((string) ($item['pack_id'] ?? ''));
                $variantId = trim((string) ($item['variant_id'] ?? ''));

                if ($type === 'pack' && $packId === '' && $itemId !== '') {
                    $item['pack_id'] = $itemId;
                }

                if ($type !== 'pack' && $variantId === '' && $itemId !== '') {
                    $item['variant_id'] = $itemId;
                }

                return $item;
            })
            ->all();

        $this->merge(['items' => $items]);

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
                $hasPackId = trim((string) ($item['pack_id'] ?? '')) !== '';

                if ($type === 'pack' && !$hasPackId) {
                    $validator->errors()->add("items.{$index}.pack_id", 'El pack_id es obligatorio para items de tipo pack.');
                }

                if ($type !== 'pack' && !$hasVariantId) {
                    $validator->errors()->add("items.{$index}.variant_id", 'El variant_id es obligatorio para items de tipo product.');
                }
            }
        });
    }
}
