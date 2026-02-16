<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\UploadedFile;

class ContentRule implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!is_array($value)) {
            $fail('El contenido debe ser un conjunto de datos válido.');
            return;
        }

        $rules = [];
        foreach ($value as $key => $val) {
            // 1. Archivos (Imágenes, videos, etc)
            if (preg_match('/(image|logo|banner|icon|photo|video|file|pdf|media)/i', $key)) {
                // Si el valor es un archivo que se está subiendo ahora
                if ($val instanceof UploadedFile) {
                    $rules[$key] = 'file|mimes:jpeg,png,jpg,gif,svg,mp4,pdf|max:10240';
                } else {
                    // Si no es un archivo, debe ser la URL (string) ya guardada
                    $rules[$key] = 'nullable|string';
                }
            }
            // 2. Fechas
            elseif (preg_match('/(date|at|time|horario)/i', $key)) {
                $rules[$key] = 'nullable|date';
            }
            // 3. Listas dinámicas
            elseif (is_array($val)) {
                $rules[$key] = preg_match('/(benefits|attributes|items)/i', $key) 
                    ? 'array|max:10' 
                    : 'array';
            }
            // 4. Todo lo demás (Textos, links, visibility)
            else {
                $rules[$key] = 'nullable'; // Permitimos tipos mixtos (bool, string, int)
            }
        }

        $validator = Validator::make($value, $rules);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $fail($error);
            }
        }
    }
}