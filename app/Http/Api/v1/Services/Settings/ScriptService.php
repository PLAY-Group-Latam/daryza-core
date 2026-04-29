<?php

namespace App\Http\Api\v1\Services\Settings;

use App\Models\Settings\Script;
use Illuminate\Support\Collection;

class ScriptService
{
  
    public function getActiveScriptsGrouped(): Collection
     {
        return Script::where('active', true)
            ->select('id', 'placement', 'content', 'consent_type')
            ->orderBy('created_at')
            ->get()
            ->groupBy('placement');
    }



}
