<?php

namespace App\Http\Web\Requests\Seo;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\UploadedFile;

class UpdateSeoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Cambiar si tienes lógica de roles
    }

    public function rules(): array
    {
        return [
            'meta_title'       => ['nullable', 'string', 'max:70'],
            'meta_description' => ['nullable', 'string', 'max:160'],
            'meta_keywords'    => ['nullable', 'string', 'max:255'],
            
            // Open Graph (Facebook/LinkedIn)
            'og_title'         => ['nullable', 'string', 'max:70'],
            'og_description'   => ['nullable', 'string', 'max:160'],
            'og_type'          => ['nullable', 'string', 'in:website,article,product'],
            
            // Imagen para SEO (GCS)
            'og_image'         => [
                'nullable',
                function ($attribute, $value, $fail) {
                    // Validamos solo si es un archivo nuevo
                    if ($value instanceof UploadedFile) {
                        $maxSize = 1024; // 1MB
                        $extension = strtolower($value->getClientOriginalExtension());
                        $allowed = ['jpg', 'jpeg', 'png', 'webp'];

                        if (!in_array($extension, $allowed)) {
                            $fail('La imagen debe ser: jpg, jpeg, png o webp.');
                        }

                        if ($value->getSize() > $maxSize * 1024) {
                            $fail('La imagen no debe pesar más de 1MB.');
                        }
                    }
                }
            ],

            // Robots / Indexación
            'noindex'          => ['nullable', 'boolean'],
            'nofollow'         => ['nullable', 'boolean'],
            'canonical_url'    => ['nullable', 'url'],
        ];
    }

    public function messages(): array
    {
        return [
            'meta_title.max' => 'El título meta no debe pasar de 70 caracteres.',
            'meta_description.max' => 'La descripción meta no debe pasar de 160 caracteres.',
            'og_image.image' => 'El archivo debe ser una imagen válida.',
        ];
    }
}