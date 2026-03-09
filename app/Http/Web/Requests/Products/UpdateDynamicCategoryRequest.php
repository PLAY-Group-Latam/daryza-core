<?php

namespace App\Http\Web\Requests\Products;

use App\Models\Products\DynamicCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDynamicCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $dynamicCategory = $this->route('dynamicCategory');
        $dynamicCategoryId = $dynamicCategory instanceof DynamicCategory ? $dynamicCategory->id : $dynamicCategory;

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('dynamic_categories', 'slug')->ignore($dynamicCategoryId)],
            'is_active' => ['sometimes', 'boolean'],
            'starts_at' => ['required', 'date'],
            'ends_at' => ['required', 'date', 'after_or_equal:starts_at'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.variant_id' => ['required', 'exists:product_variants,id'],
            'items.*.product_id' => ['required', 'exists:products,id'],
        ];
    }
}
