<?php

namespace App\Http\Web\Services\JobsPortal;

use App\Http\Web\DTO\JobsPortal\PlaceData;
use App\Models\JobsPortal\Place;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class PlaceService
{
    public function paginate(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return Place::query()
            ->search($filters['search'] ?? null)
            ->byIsActive($filters['is_active'] ?? null)
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function create(PlaceData $data): Place
    {
        return Place::create($data->toArray());
    }

    public function update(Place $place, PlaceData $data): Place
    {
        $place->update($data->toArray());

        return $place->refresh();
    }

    public function delete(Place $place): void
    {
        $place->delete();
    }
}
