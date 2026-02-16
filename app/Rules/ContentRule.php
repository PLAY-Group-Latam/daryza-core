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
            
            if (preg_match('/(image|logo|banner|icon|photo|video|file|pdf|media)/i', $key)) {

                if (is_array($val)) {
                    
                    $rules[$key] = 'array';
                    foreach ($val as $i => $item) {
                   
                        $rules["$key.$i.src"] = ['required', function($attribute, $value, $fail) {
                            if (!is_string($value) && !($value instanceof UploadedFile)) {
                                $fail("$attribute debe ser un string o un archivo válido.");
                            }
                        }];

                        $rules["$key.$i.type"] = 'required|in:image,video';
                        $rules["$key.$i.device"] = 'nullable|in:desktop,mobile,both';
                        $rules["$key.$i.link_url"] = 'nullable|string';
                    }
                } elseif ($val instanceof UploadedFile) {
                    $rules[$key] = 'file|mimes:jpeg,png,jpg,gif,svg,mp4,pdf|max:10240';
                } else {
                    $rules[$key] = 'nullable|string';
                }
            }
            
            elseif (preg_match('/(date|at|time|horario)/i', $key)) {
                $rules[$key] = 'nullable|date';
            }
            
            elseif (is_array($val)) {
                $rules[$key] = 'array';
            }
           
            else {
                $rules[$key] = 'nullable';
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
