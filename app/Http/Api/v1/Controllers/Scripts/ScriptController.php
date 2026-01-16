<?php

namespace App\Http\Api\v1\Controllers\Scripts;

use App\Http\Api\v1\Controllers\Controller;
use App\Http\Api\Traits\ApiTrait;
use App\Models\Script;
use App\Models\Scripts;

class ScriptController extends Controller
{
  use ApiTrait;

  /**
   * Obtener scripts activos para el frontend
   */
  public function index()
  {
    $scripts = Script::where('active', true)
      ->select('id', 'placement', 'content')
      ->orderBy('created_at')
      ->get()
      ->groupBy('placement');

    return response()->json([
      'head' => $scripts->get('head', []),
      'body' => $scripts->get('body', []),
    ]);
  }
}

