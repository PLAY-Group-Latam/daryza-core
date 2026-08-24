<?php

namespace App\Http\Web\Controllers\Feeds;

use App\Http\Web\Controllers\Controller;
use App\Http\Web\Services\Feeds\MetaFeedService;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class MetaFeedController extends Controller
{
    public function __invoke(MetaFeedService $metaFeedService): Response
    {
        $xmlContent = $metaFeedService->toXml();

        // Esto actúa como un "console.log" registrándolo en tu archivo storage/logs/laravel.log
        Log::info('MetaFeedController: XML generado exitosamente.', [
            'length' => strlen($xmlContent),
            'preview' => substr($xmlContent, 0, 500), // Muestra los primeros 500 caracteres para inspeccionar
        ]);

        return response($xmlContent, 200)
            ->header('Content-Type', 'application/xml; charset=UTF-8');
    }
}