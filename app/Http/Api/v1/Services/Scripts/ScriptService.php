<?php

namespace App\Http\Api\v1\Services\Scripts;

use App\Models\Script;
use Illuminate\Support\Collection;

class ScriptService
{
  
    public function getActiveScriptsGrouped(): Collection
     {
        return Script::where('active', true)
            ->select('id', 'placement', 'content')
            ->orderBy('created_at')
            ->get()
            ->groupBy('placement');
    }



}