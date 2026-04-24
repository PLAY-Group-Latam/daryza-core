<?php

namespace App\Http\Web\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class WhatsappSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $phone = preg_replace('/\D+/', '', (string) $this->input('phone', ''));

        if (str_starts_with($phone, '51') && strlen($phone) === 11) {
            $phone = substr($phone, 2);
        }

        $this->merge([
            'phone' => $phone,
            'welcome_message' => trim((string) $this->input('welcome_message', '')),
        ]);
    }

    public function rules(): array
    {
        return [
            'icon' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp,svg', 'max:2048'],
            'phone' => ['required', 'regex:/^9\d{8}$/'],
            'welcome_message' => ['required', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'icon.image' => 'El ícono debe ser una imagen válida.',
            'icon.mimes' => 'El ícono debe estar en formato png, jpg, jpeg, webp o svg.',
            'icon.max' => 'El ícono no debe superar los 2MB.',
            'phone.required' => 'El número de WhatsApp es obligatorio.',
            'phone.regex' => 'El número debe ser de Perú y tener formato 9XXXXXXXX.',
            'welcome_message.required' => 'El mensaje de bienvenida es obligatorio.',
            'welcome_message.max' => 'El mensaje de bienvenida no debe superar 1000 caracteres.',
        ];
    }
}
