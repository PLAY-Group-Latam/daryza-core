<?php

namespace App\Http\Web\Requests\Content;

use Illuminate\Foundation\Http\FormRequest;
use App\Rules\Web\Content\ContentRule;

class ContentRequest extends FormRequest
{
    public function authorize(): bool 
    { 
        return true; 
    }

    public function rules(): array
    {
        return [
         
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