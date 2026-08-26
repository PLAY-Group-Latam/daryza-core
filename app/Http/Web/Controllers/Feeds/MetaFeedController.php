<?php

namespace App\Http\Web\Controllers\Feeds;

use App\Http\Web\Controllers\Controller;
use App\Http\Web\Services\Feeds\MetaFeedService;
use Illuminate\Http\Response;

class MetaFeedController extends Controller
{
    public function __invoke(MetaFeedService $metaFeedService): Response
    {
        $xmlContent = $metaFeedService->toXml();

        return response($xmlContent, 200)
            ->header('Content-Type', 'application/xml; charset=UTF-8');
    }
}