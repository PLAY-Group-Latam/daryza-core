<?php

namespace App\Http\Web\Services\Settings;

use App\Models\Settings\Script;
use Illuminate\Pagination\LengthAwarePaginator;

class ScriptService
{
 public function paginate(int $perPage = 10, ?string $search = null): LengthAwarePaginator
{
    return Script::query()
        ->when($search, function ($query, $search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('placement', 'ilike', "%{$search}%");
            });
        })
        ->orderBy('created_at', 'desc')
        ->paginate($perPage)
        ->withQueryString();
}

    public function store(array $data): Script
    {
        return Script::create($data);
    }

    public function update(Script $script, array $data): Script
    {
        $script->update($data);
        return $script;
    }

    public function destroy(Script $script): void
    {
        $script->delete();
    }
}
