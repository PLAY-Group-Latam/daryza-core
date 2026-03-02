<?php

namespace App\Http\Web\Requests\JobsPortal;

use App\Models\JobsPortal\Area;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAreaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        /** @var Area $area */
        $area = $this->route('area');

        return [
            'name' => ['required', 'string', 'max:120', Rule::unique('areas', 'name')->ignore($area->id)],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
