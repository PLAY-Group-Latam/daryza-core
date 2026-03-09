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
        $place = Place::create($data->toArray());
        $place->areas()->sync($data->areaIds);

        return $place->load('areas');
    }

    public function update(Place $place, PlaceData $data): Place
    {
        $place->update($data->toArray());
        $place->areas()->sync($data->areaIds);

        return $place->refresh()->load('areas');
    }

    public function delete(Place $place): void
    {
        $place->delete();
    }
}
