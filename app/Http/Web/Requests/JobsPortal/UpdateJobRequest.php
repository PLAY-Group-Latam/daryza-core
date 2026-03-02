<?php

namespace App\Http\Web\Requests\JobsPortal;

use App\Enums\JobModality;
use App\Models\JobsPortal\Job;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateJobRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        /** @var Job $job */
        $job = $this->route('job');

        return [
            'title' => ['required', 'string', 'max:180'],
            'slug' => ['required', 'string', 'max:180', Rule::unique('job_offers', 'slug')->ignore($job->id)],
            'description' => ['required', 'string'],
            'requirements' => ['required', 'array', 'min:1'],
            'requirements.*' => ['required', 'string', 'max:500'],
            'benefits' => ['required', 'array', 'min:1'],
            'benefits.*' => ['required', 'string', 'max:500'],
            'modality' => ['required', Rule::enum(JobModality::class)],
            'vacancies' => ['required', 'integer', 'min:1'],
            'is_active' => ['sometimes', 'boolean'],
            'area_id' => ['required', 'exists:areas,id'],
            'place_id' => ['required', 'exists:places,id'],
        ];
    }
}
