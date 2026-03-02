<?php

namespace App\Http\Web\Resources\JobsPortal;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'requirements' => $this->requirements,
            'benefits' => $this->benefits,
            'modality' => $this->modality?->value,
            'vacancies' => $this->vacancies,
            'is_active' => (bool) $this->is_active,
            'area_id' => $this->area_id,
            'place_id' => $this->place_id,
            'area' => $this->whenLoaded('area', fn () => [
                'id' => $this->area?->id,
                'name' => $this->area?->name,
            ]),
            'place' => $this->whenLoaded('place', fn () => [
                'id' => $this->place?->id,
                'name' => $this->place?->name,
                'city' => $this->place?->city,
            ]),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
