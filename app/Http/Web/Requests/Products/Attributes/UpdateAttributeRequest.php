<?php

namespace App\Http\Web\Requests\Products\Attributes;

use App\Enums\AttributeType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateAttributeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation()
    {
        // Normalizamos values según el tipo
        if ($this->type !== AttributeType::SELECT->value) {
            $this->merge([
                'values' => [],
            ]);
        } else {
            $this->merge([
                'values' => array_values(array_filter(
                    $this->values ?? [],
                    fn($v) => is_string($v) && trim($v) !== ''
                )),
            ]);
        }

        // Aseguramos que los booleanos lleguen bien
        $this->merge([
            'is_filterable' => filter_var($this->is_filterable, FILTER_VALIDATE_BOOLEAN),
            'is_variant'    => filter_var($this->is_variant, FILTER_VALIDATE_BOOLEAN),
        ]);
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'type' => ['required', new Enum(AttributeType::class)],

            'is_filterable' => ['required', 'boolean'],
            'is_variant'    => ['required', 'boolean'],

            // Solo obligatorio si el tipo es select
            'values'   => ['required_if:type,select', 'array'],
            'values.*' => ['string', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            // Nombre
            'name.required' => 'El nombre del atributo es obligatorio.',
            'name.string'   => 'El nombre del atributo debe ser un texto.',
            'name.max'      => 'El nombre del atributo no puede tener más de 100 caracteres.',

            // Tipo
            'type.required' => 'Debes seleccionar un tipo de atributo.',
            'type.enum'     => 'El tipo de atributo seleccionado no es válido.',

            // Filtro
            'is_filterable.required' => 'Debes indicar si el atributo será usado como filtro.',
            'is_filterable.boolean'  => 'El campo "filtrable" debe ser verdadero o falso.',

            // Variante
            'is_variant.required' => 'Debes indicar si este atributo genera variantes.',
            'is_variant.boolean'  => 'El campo "es variante" debe ser verdadero o falso.',

            // Valores
            'values.required_if' => 'Debes ingresar al menos un valor cuando el tipo es "Lista de opciones".',
            'values.array'       => 'Los valores deben enviarse como una lista.',

            'values.*.string' => 'Cada valor del atributo debe ser un texto.',
            'values.*.max'    => 'Cada valor del atributo no puede tener más de 100 caracteres.',
        ];
    }
}
