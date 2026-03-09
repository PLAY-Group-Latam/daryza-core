<?php

namespace App\Http\Web\Resources\JobsPortal;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'cv_path' => $this->cv_path,
            'cv_url' => str_starts_with((string) $this->cv_path, 'http')
                ? $this->cv_path
                : asset('storage/' . ltrim((string) $this->cv_path, '/')),
            'job_id' => $this->job_id,
            'job' => $this->whenLoaded('job', fn () => [
                'id' => $this->job?->id,
                'title' => $this->job?->title,
                'slug' => $this->job?->slug,
                'description' => $this->job?->description,
                'modality' => $this->job?->modality?->value,
                'vacancies' => $this->job?->vacancies,
                'area' => $this->job?->area ? [
                    'id' => $this->job->area->id,
                    'name' => $this->job->area->name,
                ] : null,
                'place' => $this->job?->place ? [
                    'id' => $this->job->place->id,
                    'name' => $this->job->place->name,
                    'city' => $this->job->place->city,
                    'address' => $this->job->place->address,
                ] : null,
            ]),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
