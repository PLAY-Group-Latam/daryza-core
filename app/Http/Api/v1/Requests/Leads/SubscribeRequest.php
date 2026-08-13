<?php

namespace App\Http\Api\v1\Requests\Leads;

use App\Models\Leads\Lead;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;
use App\Http\Api\Traits\ApiTrait;

class SubscribeRequest extends FormRequest
{
    use ApiTrait;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => [
                'required',
                'email',
                Rule::unique('leads', 'email')->where(function ($query) {
                    return $query->where('type', Lead::TYPE_NEWSLETTER)
                                 ->whereNull('deleted_at');
                }),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email'    => 'Debes ingresar un correo electrónico válido.',
            'email.unique'   => 'Este correo ya está registrado.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        $errors = $validator->errors();


        if ($errors->has('email') && str_contains($errors->first('email'), 'ya está registrado')) {
            throw new HttpResponseException(
                $this->error(
                    'Este correo ya está registrado. ¡Gracias por formar parte de la comunidad de Daryza!',
                    $errors,
                    409
                )
            );
        }

        // Error estándar de validación (HTTP 422)
        throw new HttpResponseException(
            $this->error('Error de validación', $errors, 422)
        );
    }
}