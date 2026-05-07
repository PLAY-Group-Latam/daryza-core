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

    public function messages(): array
{
    return [
        // Customer info
        'customer_info.required' => 'La información del cliente es obligatoria.',
        'customer_info.array' => 'La información del cliente debe ser un arreglo.',
        'customer_info.email.required' => 'El correo electrónico es obligatorio.',
        'customer_info.email.email' => 'El correo electrónico no es válido.',
        'customer_info.email.max' => 'El correo electrónico no debe exceder los 255 caracteres.',
        'customer_info.first_name.required' => 'El nombre es obligatorio.',
        'customer_info.first_name.max' => 'El nombre no debe exceder los 120 caracteres.',
        'customer_info.last_name.required' => 'El apellido es obligatorio.',
        'customer_info.last_name.max' => 'El apellido no debe exceder los 120 caracteres.',
        'customer_info.document_type.required' => 'El tipo de documento es obligatorio.',
        'customer_info.document_type.in' => 'El tipo de documento debe ser DNI o CE.',
        'customer_info.document_number.required' => 'El número de documento es obligatorio.',
        'customer_info.mobile_phone.required' => 'El número de celular es obligatorio.',

        // Voucher
        'voucher_type.required' => 'El tipo de comprobante es obligatorio.',
        'voucher_type.in' => 'El tipo de comprobante debe ser boleta o factura.',

        // Billing
        'billing_info.array' => 'La información de facturación debe ser un arreglo.',
        'billing_info.ruc.required_if' => 'El RUC es obligatorio cuando el comprobante es factura.',
        'billing_info.ruc.digits' => 'El RUC debe tener exactamente 11 dígitos.',
        'billing_info.social_reason.required_if' => 'La razón social es obligatoria para facturas.',
        'billing_info.fiscal_address.required_if' => 'La dirección fiscal es obligatoria para facturas.',

        // Shipping
        'shipping_info.required' => 'La información de envío es obligatoria.',
        'shipping_info.department_id.required' => 'El departamento es obligatorio.',
        'shipping_info.department_id.exists' => 'El departamento seleccionado no es válido.',
        'shipping_info.province_id.required' => 'La provincia es obligatoria.',
        'shipping_info.province_id.exists' => 'La provincia seleccionada no es válida.',
        'shipping_info.district_id.required' => 'El distrito es obligatorio.',
        'shipping_info.district_id.exists' => 'El distrito seleccionado no es válido.',
        'shipping_info.address_line.required' => 'La dirección es obligatoria.',

        // Items
        'items.required' => 'Debe agregar al menos un producto.',
        'items.array' => 'Los items deben ser un arreglo.',
        'items.min' => 'Debe agregar al menos un producto.',
        'items.*.quantity.required' => 'La cantidad es obligatoria.',
        'items.*.quantity.integer' => 'La cantidad debe ser un número entero.',
        'items.*.quantity.min' => 'La cantidad mínima es 1.',
        'items.*.quantity.max' => 'La cantidad máxima es 999.',
        'items.*.variant_id.exists' => 'La variante seleccionada no es válida.',
        'items.*.pack_id.exists' => 'El pack seleccionado no es válido.',

        // Coupon
        'coupon_code.max' => 'El cupón no debe exceder los 50 caracteres.',

        // Payment
        'payment_info.required' => 'La información de pago es obligatoria.',
        'payment_info.method.required' => 'El método de pago es obligatorio.',
        'payment_info.method.in' => 'El método de pago debe ser transferencia bancaria o Niubiz.',
        'payment_info.voucher_file.file' => 'El comprobante debe ser un archivo válido.',
        'payment_info.voucher_file.mimes' => 'El comprobante debe ser JPG, JPEG, PNG o PDF.',
        'payment_info.voucher_file.max' => 'El comprobante no debe superar los 6MB.',

        // Notes
        'notes.max' => 'Las notas no deben exceder los 1000 caracteres.',
    ];
}
    
}
