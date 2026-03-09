<?php

namespace App\Http\Web\DTO\JobsPortal;

readonly class AreaData
{
    public function __construct(public string $name, public bool $isActive)
    {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'],
            isActive: (bool) ($data['is_active'] ?? true),
        );
    }

    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'is_active' => $this->isActive,
        ];
    }
}
