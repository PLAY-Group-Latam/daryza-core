<?php

namespace App\Http\Web\DTO\JobsPortal;

readonly class PlaceData
{
    public function __construct(
        public string $name,
        public string $address,
        public string $city,
        public bool $isActive,
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'],
            address: $data['address'],
            city: $data['city'],
            isActive: (bool) ($data['is_active'] ?? true),
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
