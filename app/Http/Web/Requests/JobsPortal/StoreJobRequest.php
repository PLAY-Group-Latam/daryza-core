<?php

namespace App\Http\Web\Requests\JobsPortal;

use App\Enums\OgType;
use App\Enums\JobModality;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreJobRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:180'],
            'slug' => ['required', 'string', 'max:180', Rule::unique('job_offers', 'slug')],
            'image' => ['nullable', 'file', 'image', 'max:5120'],
            'description' => ['required', 'string'],
            'requirements' => ['required', 'string'],
            'benefits' => ['required', 'string'],
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
            'metadata.og_type' => ['nullable', 'string', 'max:50', Rule::in(array_column(OgType::cases(), 'value'))],
            'metadata.canonical_url' => ['nullable', 'url', 'max:500'],
            'metadata.noindex' => ['nullable', 'boolean'],
            'metadata.nofollow' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'El título de la oferta es obligatorio.',
            'title.max' => 'El título no puede superar 180 caracteres.',
            'slug.required' => 'El slug es obligatorio.',
            'slug.max' => 'El slug no puede superar 180 caracteres.',
            'slug.unique' => 'Este slug ya está en uso.',
            'image.image' => 'El archivo debe ser una imagen válida.',
            'image.max' => 'La imagen no puede superar 5MB.',
            'description.required' => 'La descripción es obligatoria.',
            
            'requirements.required' => 'Debes ingresar los requisitos de la oferta.',
            'requirements.string' => 'Los requisitos deben ser un texto válido.',
            
            'benefits.required' => 'Debes ingresar los beneficios de la oferta.',
            'benefits.string' => 'Los beneficios deben ser un texto válido.',

            'modality.required' => 'La modalidad es obligatoria.',
            'vacancies.required' => 'La cantidad de vacantes es obligatoria.',
            'vacancies.integer' => 'Las vacantes deben ser un número entero.',
            'vacancies.min' => 'Debe haber al menos 1 vacante.',
            'is_active.boolean' => 'El estado activo debe ser verdadero o falso.',
            'area_id.required' => 'Debes seleccionar un área.',
            'area_id.exists' => 'El área seleccionada no existe.',
            'place_id.required' => 'Debes seleccionar una sede.',
            'place_id.exists' => 'La sede seleccionada no existe.',
            'metadata.array' => 'La sección SEO es inválida.',
            'metadata.meta_title.max' => 'El meta title no puede superar 160 caracteres.',
            'metadata.meta_description.max' => 'La meta description no puede superar 320 caracteres.',
            'metadata.canonical_url.url' => 'La URL canónica no tiene un formato válido.',
            'metadata.canonical_url.max' => 'La URL canónica no puede superar 500 caracteres.',
            'metadata.noindex.boolean' => 'Noindex debe ser verdadero o falso.',
            'metadata.nofollow.boolean' => 'Nofollow debe ser verdadero o falso.',
        ];
    }
}