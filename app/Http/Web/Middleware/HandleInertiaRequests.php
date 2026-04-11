<?php

namespace App\Http\Web\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Http\Web\Services\Distributors\DistributorsService;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     */
    protected $rootView = 'app';
    protected DistributorsService $distributorsService;

    public function __construct(DistributorsService $distributorsService)
    {
        $this->distributorsService = $distributorsService;
    }

    /**
     * Determines the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');
        $flash = session('flash'); 
        $mapPin = $this->distributorsService->getMapPin();
        $mapPinUrl = $mapPin->logo_pin ?? asset('images/distributors/marker-icon.svg'); 

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
            ],
            'mapPin' => [
                'url' => $mapPinUrl,
            ],
        ];
    }
}