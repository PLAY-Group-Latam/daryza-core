<?php

namespace  App\Http\Api\v1\Requests\Leads;

use App\Rules\ValidPeruvianDocument;
use App\Rules\ValidPeruvianPhone;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class ContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            'type' => ['required', Rule::in($this->allowedTypes())],
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', new ValidPeruvianPhone],
            'ruc_or_dni' => ['required' , 'string', new ValidPeruvianDocument],
            'comments' => ['nullable', 'string', 'max:1000'],

            ...$this->helpCenterRules(),
            ...$this->distributorNetworkRules(),
            ...$this->salesAdvisorRules(),
            ...$this->customerServiceRules(),

            'file_attached' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png,doc,docx', 'max:5120'],
        ];
    }


    protected function allowedTypes(): array
    {
        return [
            'help_center',
            'distributor_network',
            'customer_service',
            'sales_advisor'
        ];
    }


    protected function helpCenterRules(): array
    {
        return [
            'contact_reason' => ['required_if:type,help_center', 'string', 'max:255'],
            'purchase_document' => ['required_if:type,help_center', 'string', 'max:255'],
            'purchase_date' => ['required_if:type,help_center', 'date', 'before_or_equal:today'],
        ];
    }


    protected function distributorNetworkRules(): array
    {
        return [
            'company_name' => ['required_if:type,distributor_network', 'string', 'max:255'],
            'province' => ['required_if:type,distributor_network', 'string', 'max:100'],
            'address' => ['required_if:type,distributor_network', 'string', 'max:255'],
            'department' => ['required_if:type,distributor_network', 'string', 'max:100'],
            'district' => ['required_if:type,distributor_network', 'string', 'max:100'],
            'number_of_sellers' => ['required_if:type,distributor_network', 'integer', 'min:1', 'max:10000'],
            'other_products' => ['nullable', 'string', 'max:500'],
        ];
    }


    protected function salesAdvisorRules(): array
    {
        return [
            'company_name' => ['required_if:type,sales_advisor', 'string', 'max:255'],
            'province' => ['required_if:type,sales_advisor', 'string', 'max:100'],
        ];
    }


    protected function customerServiceRules(): array
    {
        return [
            'purchase_document_number' => ['required_if:type,customer_service', 'string', 'max:50'],
        ];
    }

    public function attributes(): array
    {
        return [
            'type' => 'tipo de contacto',
            'full_name' => 'nombre completo',
            'email' => 'correo electrónico',
            'phone' => 'teléfono',
            'ruc_or_dni' => 'DNI, CE o RUC',
            'comments' => 'comentarios',
            'contact_reason' => 'motivo de contacto',
            'purchase_document' => 'documento de compra',
            'purchase_date' => 'fecha de compra',
            'company_name' => 'nombre de la empresa',
            'province' => 'provincia',
            'address' => 'dirección',
            'department' => 'departamento',
            'district' => 'distrito',
            'number_of_sellers' => 'número de vendedores',
            'other_products' => 'otros productos',
            'purchase_document_number' => 'número de documento de compra',
            'file_attached' => 'archivo adjunto',
        ];
    }

    public function messages(): array
    {
        return [
            // Type
            'type.required' => 'Debe seleccionar un tipo de contacto.',
            'type.in' => 'El tipo de contacto seleccionado no es válido.',

            // Common fields
            'full_name.required' => 'El nombre completo es obligatorio.',
            'full_name.max' => 'El nombre completo no puede exceder 255 caracteres.',
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'El correo electrónico debe ser una dirección válida.',
            'email.max' => 'El correo electrónico no puede exceder 255 caracteres.',
            'phone.required' => 'El teléfono es obligatorio.',
            'ruc_or_dni.required' => 'El DNI, CE o RUC es obligatorio.',
            'comments.max' => 'Los comentarios no pueden exceder 1000 caracteres.',

            // Help Center
            'contact_reason.required_if' => 'El motivo de contacto es obligatorio para Centro de Ayuda.',
            'contact_reason.max' => 'El motivo de contacto no puede exceder 255 caracteres.',
            'purchase_document.required_if' => 'El documento de compra es obligatorio para Centro de Ayuda.',
            'purchase_document.max' => 'El documento de compra no puede exceder 255 caracteres.',
            'purchase_date.required_if' => 'La fecha de compra es obligatoria para Centro de Ayuda.',
            'purchase_date.date' => 'La fecha de compra debe ser una fecha válida.',
            'purchase_date.before_or_equal' => 'La fecha de compra no puede ser futura.',

            // Distributor Network & Sales Advisor
            'company_name.required_if' => 'El nombre de la empresa es obligatorio.',
            'company_name.max' => 'El nombre de la empresa no puede exceder 255 caracteres.',
            'department.required_if' => 'El departamento es obligatorio.',
            'province.required_if' => 'La provincia es obligatoria.',
            'province.max' => 'La provincia no puede exceder 100 caracteres.',

            // Distributor Network only
            'address.required_if' => 'La dirección es obligatoria para Red de Distribuidores.',
            'address.max' => 'La dirección no puede exceder 255 caracteres.',
            'district.required_if' => 'El distrito es obligatorio para Red de Distribuidores.',
            'district.max' => 'El distrito no puede exceder 100 caracteres.',
            'number_of_sellers.required_if' => 'El número de vendedores es obligatorio para Red de Distribuidores.',
            'number_of_sellers.integer' => 'El número de vendedores debe ser un número entero.',
            'number_of_sellers.min' => 'Debe haber al menos 1 vendedor.',
            'number_of_sellers.max' => 'El número de vendedores no puede exceder 10,000.',
            'other_products.max' => 'Otros productos no puede exceder 500 caracteres.',

            // Customer Service
            'purchase_document_number.required_if' => 'El número de documento de compra es obligatorio para Servicio al Cliente.',
            'purchase_document_number.max' => 'El número de documento no puede exceder 50 caracteres.',

            // File
            'file_attached.file' => 'El archivo adjunto debe ser un archivo válido.',
            'file_attached.mimes' => 'El archivo debe ser de tipo: PDF, JPG, PNG, DOC o DOCX.',
            'file_attached.max' => 'El archivo no puede exceder 5MB.',
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Error de validación. Por favor, revise los campos.',
                'errors' => $validator->errors()
            ], 422)
        );
    }

    /**
     * Sanitizar datos antes de validar
     */
    protected function prepareForValidation()
    {
        $this->merge([
            // Limpiar teléfono
            'phone' => isset($this->phone) ? trim($this->phone) : null,

            // Limpiar DNI/RUC
            'ruc_or_dni' => isset($this->ruc_or_dni)
                ? preg_replace('/[^0-9]/', '', $this->ruc_or_dni)
                : null,

            // Limpiar nombre
            'full_name' => isset($this->full_name)
                ? preg_replace('/\s+/', ' ', trim($this->full_name))
                : null,

            // Limpiar email
            'email' => isset($this->email)
                ? strtolower(trim($this->email))
                : null,
        ]);
    }
}
