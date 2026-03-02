<?php

namespace App\Http\Web\DTO\JobsPortal;

use App\Enums\JobModality;

readonly class JobData
{
    public function __construct(
        public string $title,
        public string $slug,
        public string $description,
        public array $requirements,
        public array $benefits,
        public JobModality $modality,
        public int $vacancies,
        public bool $isActive,
        public string $areaId,
        public string $placeId,
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            title: $data['title'],
            slug: $data['slug'],
            description: $data['description'],
            requirements: $data['requirements'],
            benefits: $data['benefits'],
            modality: $data['modality'] instanceof JobModality ? $data['modality'] : JobModality::from($data['modality']),
            vacancies: (int) $data['vacancies'],
            isActive: (bool) ($data['is_active'] ?? true),
            areaId: $data['area_id'],
            placeId: $data['place_id'],
        );
    }

    public function toArray(): array
    {
        return [
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'requirements' => $this->requirements,
            'benefits' => $this->benefits,
            'modality' => $this->modality,
            'vacancies' => $this->vacancies,
            'is_active' => $this->isActive,
            'area_id' => $this->areaId,
            'place_id' => $this->placeId,
        ];
    }
}
