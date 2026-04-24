<?php

namespace App\Http\Api\v1\Requests\Orders;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_info' => ['required', 'array'],
            'customer_info.email' => ['required', 'email', 'max:255'],
            'customer_info.first_name' => ['required', 'string', 'max:120'],
            'customer_info.last_name' => ['required', 'string', 'max:120'],
            'customer_info.document_type' => ['required', 'in:dni,ce'],
            'customer_info.document_number' => ['required', 'string', 'max:20'],
            'customer_info.mobile_phone' => ['required', 'string', 'max:20'],

            'voucher_type' => ['required', 'in:boleta,factura'],
            'billing_info' => ['nullable', 'array'],
            'billing_info.ruc' => ['required_if:voucher_type,factura', 'nullable', 'digits:11'],
            'billing_info.social_reason' => ['required_if:voucher_type,factura', 'nullable', 'string', 'max:255'],
            'billing_info.fiscal_address' => ['required_if:voucher_type,factura', 'nullable', 'string', 'max:255'],

            'shipping_info' => ['required', 'array'],
            'shipping_info.department_id' => ['required', 'exists:departments,id'],
            'shipping_info.province_id' => ['required', 'exists:provinces,id'],
            'shipping_info.district_id' => ['required', 'exists:districts,id'],
            'shipping_info.address_line' => ['required', 'string', 'max:255'],
            'shipping_info.number' => ['nullable', 'string', 'max:30'],
            'shipping_info.floor_apartment' => ['nullable', 'string', 'max:30'],
            'shipping_info.reference' => ['nullable', 'string', 'max:255'],

            'items' => ['required', 'array', 'min:1'],
            'items.*.type' => ['nullable', 'in:product,pack'],
            'items.*.item_id' => ['nullable', 'string'],
            'items.*.variant_id' => ['nullable', 'exists:product_variants,id'],
            'items.*.pack_id' => ['nullable', 'exists:product_packs,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:999'],
            'coupon_code' => ['nullable', 'string', 'max:50'],

            'payment_info' => ['required', 'array'],
            'payment_info.method' => ['required', 'in:bank_transfer,niubiz'],
            'payment_info.voucher_file' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:6144'],

            'notes' => ['nullable', 'string', 'max:1000'],
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
