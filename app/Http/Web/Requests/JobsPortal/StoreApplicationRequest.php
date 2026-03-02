<?php

namespace App\Http\Web\Requests\JobsPortal;

use Illuminate\Foundation\Http\FormRequest;

class StoreApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:120'],
            'last_name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:120'],
            'phone' => ['required', 'string', 'max:30'],
            'cv' => ['required', 'file', 'mimes:pdf,doc,docx', 'max:5120'],
            'job_id' => ['required', 'exists:job_offers,id'],
        ];
    }
}
