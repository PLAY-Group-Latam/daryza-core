<?php

namespace App\Http\Web\DTO\JobsPortal;

readonly class PlaceData
{
    public function __construct(
        public string $name,
        public string $address,
        public ?string $city, // <-- Se agrega ? para permitir null
        public bool $isActive,
        public array $areaIds,
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'],
            address: $data['address'],
            city: $data['city'] ?? null, // <-- Fallback a null si no viene
            isActive: (bool) ($data['is_active'] ?? true),
            areaIds: $data['area_ids'] ?? [],
        );
    }

    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'address' => $this->address,
            'city' => $this->city,
            'is_active' => $this->isActive,
        ];
    }
}