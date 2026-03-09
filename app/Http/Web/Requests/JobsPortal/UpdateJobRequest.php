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
            'image' => ['nullable', 'file', 'image', 'max:5120'],
            'description' => ['required', 'string'],
            'requirements' => ['required', 'array', 'min:1'],
            'requirements.*' => ['required', 'string', 'max:500'],
            'benefits' => ['required', 'array', 'min:1'],
            'benefits.*' => ['required', 'string', 'max:500'],
            'modality' => ['required', Rule::enum(JobModality::class)],
            'vacancies' => ['required', 'integer', 'min:1'],
            'is_active' => ['sometimes', 'boolean'],
            'area_id' => ['required', 'exists:areas,id'],
            'place_id' => [
                'required',
                'exists:places,id',
                Rule::exists('area_place', 'place_id')->where(fn ($query) => $query->where('area_id', $this->input('area_id'))),
            ],
            'metadata' => ['nullable', 'array'],
            'metadata.meta_title' => ['nullable', 'string', 'max:160'],
            'metadata.meta_description' => ['nullable', 'string', 'max:320'],
            'metadata.canonical_url' => ['nullable', 'url', 'max:500'],
            'metadata.noindex' => ['nullable', 'boolean'],
            'metadata.nofollow' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return (new StoreJobRequest())->messages();
    }
}
