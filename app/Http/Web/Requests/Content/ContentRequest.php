<?php

namespace App\Http\Web\Requests\Content;

use Illuminate\Foundation\Http\FormRequest;
use App\Rules\ContentRule; 

class ContentRequest extends FormRequest
{
    public function authorize(): bool 
    { 
        return true; 
    }

    public function rules(): array
    {
        return [
            // Validamos que el contenido sea un array y pase nuestra regla dinámica
            'content' => ['required', 'array', new ContentRule],
        ];
    }

    public function attributes(): array
    {
        return [
            'content' => 'contenido de la sección',
        ];
    }
}