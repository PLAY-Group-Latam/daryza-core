<?php

namespace App\Http\Web\Services\JobsPortal;

use App\Http\Web\DTO\JobsPortal\AreaData;
use App\Models\JobsPortal\Area;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class AreaService
{
    public function paginate(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return Area::query()
            ->search($filters['search'] ?? null)
            ->byIsActive($filters['is_active'] ?? null)
            ->orderBy('name', 'asc')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function create(AreaData $data): Area
    {
        return Area::create($data->toArray());
    }

    public function update(Area $area, AreaData $data): Area
    {
        $area->update($data->toArray());

        return $area->refresh();
    }

    public function delete(Area $area): void
    {
        $area->delete();
    }
}
