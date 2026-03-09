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
            'image_url' => $this->image_url ?? null,
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
            'metadata' => $this->whenLoaded('metadata', fn () => [
                'meta_title' => $this->metadata?->meta_title,
                'meta_description' => $this->metadata?->meta_description,
                'canonical_url' => $this->metadata?->canonical_url,
                'noindex' => (bool) ($this->metadata?->noindex ?? false),
                'nofollow' => (bool) ($this->metadata?->nofollow ?? false),
            ]),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
