<?php

namespace App\Http\Api\v1\Requests\Landings;

use App\Rules\ValidPeruvianPhone;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreLandingLeadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', new ValidPeruvianPhone],
            'email' => ['required', 'email', 'max:255'],
            'ruc_or_dni' => ['required', 'string', 'max:20'],
            'company_name' => ['required', 'string', 'max:255'],
            'comments' => ['nullable', 'string', 'max:2000'],
            'form_key' => ['nullable', 'string', 'max:100'],
            'source_data' => ['nullable', 'array'],
            'page_url' => ['nullable', 'string', 'max:500'],
            'referrer' => ['nullable', 'string', 'max:500'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'full_name' => $this->input('full_name', $this->input('fullName')),
            'ruc_or_dni' => $this->input('ruc_or_dni', $this->input('ruc')),
            'company_name' => $this->input('company_name', $this->input('company')),
            'form_key' => $this->input('form_key', $this->input('formKey', 'advisor_form')),
            'source_data' => $this->input('source_data', $this->input('sourceData')),
            'page_url' => $this->input('page_url', $this->input('pageUrl')),
        ]);
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Error de validación.',
                'errors' => $validator->errors(),
            ], 422)
        );
    }
}
