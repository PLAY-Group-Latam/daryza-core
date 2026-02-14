<?php

namespace App\Http\Web\Requests\Content;

use Illuminate\Foundation\Http\FormRequest;

class ContentRequest extends FormRequest
{
   public function authorize(): bool { return true; }

   public function rules(): array
    {
        return [
            'content' => 'required|array',
            
            ...match ($this->route('type')) {
                'home_modal' => [
                    'content.image' => 'nullable|image|max:5120',
                    'content.start_date' => 'nullable|date',
                    'content.end_date' => 'nullable|date',
                    'content.is_visible' => 'boolean',
                ],
                'home_benefits' => [
                    'content.items' => 'array|max:4',
                ],
                'editor_text' => [
                    'content.text' => 'required|string',
                ],
                default => [],
            }
        ];
    }
}
