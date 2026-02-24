<?php

namespace App\Http\Api\v1\Requests\Content;

use Illuminate\Foundation\Http\FormRequest;

class ContentRequest extends FormRequest
{
   public function authorize(): bool 
    { 
        return true; 
    }


    public function rules(): array
    {
        return [
         
            'slug' => 'required|string',
            'type' => 'required|string',
            'id'   => 'required|integer',
        ];
    }

    protected function prepareForValidation()
    {
        $this->merge([
            'slug' => $this->route('slug'),
            'type' => $this->route('type'),
            'id'   => $this->route('id'),
        ]);
    }
}
