<?php

namespace App\Http\Web\Services\Scripts;

use App\Models\Script;
use Illuminate\Pagination\LengthAwarePaginator;

class ScriptService
{
    public function paginate(int $perPage = 10): LengthAwarePaginator
    {
        return Script::orderBy('created_at', 'desc')->paginate($perPage);
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