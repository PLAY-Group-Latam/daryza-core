<?php

namespace App\Http\Web\Requests\Coupons;

use Illuminate\Foundation\Http\FormRequest;
use App\Enums\Coupon\CouponScope;
use App\Enums\Coupon\CouponDiscountType;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class CouponRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
   protected function baseRules(): array
    {
        return [
            'code'                    => ['required', 'string', 'max:50'],
            'description'             => ['nullable', 'string'],

            'discount_type'           => ['required', Rule::enum(CouponDiscountType::class)],
            'discount_amount'         => ['required', 'numeric', 'min:0'],
            'maximum_discount_amount' => [
                'nullable',
                'numeric',
                'min:0',
                function ($attribute, $value, $fail) {
                    if ($this->input('discount_type') !== 'percentage' && $value !== null) {
                        $fail('El máximo descuento solo aplica para descuentos porcentuales.');
                    }
                },
            ],

            'scope'                => ['required', Rule::enum(CouponScope::class)],
            'minimum_order_amount' => ['required', 'numeric', 'min:0'],
            'is_active'            => ['required', 'boolean'],
            'is_public'            => ['required', 'boolean'],

            'valid_from'  => ['nullable', 'date'],
            'valid_until' => ['nullable', 'date', 'after:valid_from'],

            'usage_limit'          => ['nullable', 'integer', 'min:1'],
            'usage_limit_per_user' => ['nullable', 'integer', 'min:1'],

            // Relaciones — requeridas condicionalmente según scope
            'product_ids'       => [Rule::requiredIf($this->input('scope') === 'product'), 'array'],
            'product_ids.*'     => ['exists:products,id'],

            'category_ids'      => [Rule::requiredIf($this->input('scope') === 'category'), 'array'],
            'category_ids.*'    => ['exists:product_categories,id'],

            'pack_ids'          => [Rule::requiredIf($this->input('scope') === 'pack'), 'array'],
            'pack_ids.*'        => ['exists:product_packs,id'],

            'business_line_ids'     => [Rule::requiredIf($this->input('scope') === 'business_line'), 'array'],
            'business_line_ids.*'   => ['exists:business_lines,id'],

            'customer_ids'      => [Rule::requiredIf($this->input('scope') === 'customer'), 'array'],
            'customer_ids.*'    => ['exists:customers,id'],
        ];
    }

     public function messages(): array
    {
        return [
            'code.required'        => 'El código del cupón es obligatorio.',
            'code.string'          => 'El código debe ser texto.',
            'code.max'             => 'El código no puede superar los 50 caracteres.',
            'code.unique'          => 'El código ya está en uso.',

            'discount_type.required' => 'El tipo de descuento es obligatorio.',
            'discount_type.enum'     => 'El tipo de descuento no es válido.',
            'discount_amount.required' => 'El monto de descuento es obligatorio.',
            'discount_amount.numeric'  => 'Debe ser un número.',
            'discount_amount.min'      => 'No puede ser negativo.',

            'maximum_discount_amount.numeric' => 'Debe ser un número.',
            'maximum_discount_amount.min'     => 'No puede ser negativo.',

            'scope.required' => 'El alcance del cupón es obligatorio.',
            'scope.enum'     => 'El alcance seleccionado no es válido.',

            'minimum_order_amount.required' => 'El monto mínimo de compra es obligatorio.',
            'minimum_order_amount.numeric'  => 'Debe ser un número.',
            'minimum_order_amount.min'      => 'No puede ser negativo.',

            'is_active.required' => 'El estado activo es obligatorio.',
            'is_active.boolean'  => 'Debe ser verdadero o falso.',
            'is_public.required' => 'El estado público es obligatorio.',
            'is_public.boolean'  => 'Debe ser verdadero o falso.',

            'valid_from.date'        => 'La fecha de inicio no es válida.',
            'valid_until.date'       => 'La fecha de fin no es válida.',
            'valid_until.after'      => 'Debe ser posterior a la fecha de inicio.',

            'usage_limit.integer'          => 'Debe ser un número entero.',
            'usage_limit.min'              => 'Debe ser al menos 1.',
            'usage_limit_per_user.integer' => 'Debe ser un número entero.',
            'usage_limit_per_user.min'     => 'Debe ser al menos 1.',

            'product_ids.required'        => 'Debes seleccionar al menos un producto.',
            'product_ids.*.exists'        => 'Un producto seleccionado no es válido.',
            'category_ids.required'       => 'Debes seleccionar al menos una categoría.',
            'category_ids.*.exists'       => 'Una categoría seleccionada no es válida.',
            'pack_ids.required'           => 'Debes seleccionar al menos un pack.',
            'pack_ids.*.exists'           => 'Un pack seleccionado no es válido.',
            'business_line_ids.required'  => 'Debes seleccionar al menos una línea de negocio.',
            'business_line_ids.*.exists'  => 'Una línea de negocio seleccionada no es válida.',
            'customer_ids.required'       => 'Debes seleccionar al menos un cliente.',
            'customer_ids.*.exists'       => 'Un cliente seleccionado no es válido.',
        ];
    }

     protected function prepareForValidation(): void
    {
        $data = $this->all();

        $this->merge([
            'code'                    => strtoupper(trim((string) ($data['code'] ?? ''))),
            'is_active'               => filter_var($data['is_active'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'is_public'               => filter_var($data['is_public'] ?? true, FILTER_VALIDATE_BOOLEAN),
            'discount_type'           => strtolower(trim($data['discount_type'] ?? '')),
            'scope'                   => strtolower(trim($data['scope'] ?? '')),
            'discount_amount'         => isset($data['discount_amount']) ? max(0, floatval($data['discount_amount'])) : null,
            'minimum_order_amount'    => isset($data['minimum_order_amount']) ? max(0, floatval($data['minimum_order_amount'])) : null,
            'maximum_discount_amount' => isset($data['maximum_discount_amount']) && $data['maximum_discount_amount'] !== ''
                ? floatval($data['maximum_discount_amount'])
                : null,
            'usage_limit'             => isset($data['usage_limit']) && is_numeric($data['usage_limit'])
                ? (int) $data['usage_limit']
                : null,
            'usage_limit_per_user'    => isset($data['usage_limit_per_user']) && is_numeric($data['usage_limit_per_user'])
                ? (int) $data['usage_limit_per_user']
                : null,
            'valid_from'              => $this->formatDate($data['valid_from'] ?? null),
            'valid_until'             => $this->formatDate($data['valid_until'] ?? null),
            'product_ids'             => $this->parseArray($data['product_ids'] ?? null),
            'category_ids'            => $this->parseArray($data['category_ids'] ?? null),
            'pack_ids'                => $this->parseArray($data['pack_ids'] ?? null),
            'business_line_ids'       => $this->parseArray($data['business_line_ids'] ?? null),
            'customer_ids'            => $this->parseArray($data['customer_ids'] ?? null),
        ]);
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $global  = $this->input('usage_limit');
            $perUser = $this->input('usage_limit_per_user');

            if (
                is_numeric($global) &&
                is_numeric($perUser) &&
                (int) $perUser > (int) $global
            ) {
                $validator->errors()->add(
                    'usage_limit_per_user',
                    'El límite por usuario no puede ser mayor que el límite global.'
                );
            }
        });
    }

    private function formatDate(?string $date): ?string
    {
        if (!$date) return null;
        $parsed = date_create($date);
        return $parsed ? $parsed->format('Y-m-d H:i:s') : $date;
    }

    private function parseArray(mixed $value): array
    {
        if (is_array($value)) return $value;
        if (is_string($value) && !empty($value)) {
            $decoded = json_decode($value, true);
            return is_array($decoded) ? $decoded : [];
        }
        return [];
    }
}
