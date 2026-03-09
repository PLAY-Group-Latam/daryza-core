<?php

namespace App\Http\Api\v1\Controllers\JobsPortal;

use App\Http\Api\Traits\ApiTrait;
use App\Http\Api\v1\Controllers\Controller;
use App\Http\Api\v1\Requests\JobsPortal\StoreApplicationRequest;
use App\Http\Web\DTO\JobsPortal\ApplicationData;
use App\Http\Web\Resources\JobsPortal\ApplicationResource;
use App\Http\Web\Resources\JobsPortal\JobResource;
use App\Http\Web\Services\JobsPortal\ApplicationService;
use App\Http\Web\Services\JobsPortal\JobService;
use App\Models\JobsPortal\Area;
use App\Models\JobsPortal\Place;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JobsPortalApiController extends Controller
{
    use ApiTrait;

    public function __construct(
        private readonly JobService $jobService,
        private readonly ApplicationService $applicationService,
    ) {}

    public function offers(Request $request): JsonResponse
    {
        $filters = $request->only([
            'search',
            'q',
            'location',
            'area_id',
            'place_id',
            'modality',
        ]);

        $offers = $this->jobService->paginate($filters, (int) $request->input('per_page', 10), true);

        return response()->json([
            'success' => true,
            'message' => 'Ofertas listadas correctamente.',
            'data' => JobResource::collection($offers),
            'meta' => [
                'current_page' => $offers->currentPage(),
                'last_page' => $offers->lastPage(),
                'per_page' => $offers->perPage(),
                'total' => $offers->total(),
                'has_more_pages' => $offers->hasMorePages(),
                'next_page_url' => $offers->nextPageUrl(),
            ],
        ]);
    }

    public function filters(): JsonResponse
    {
        return $this->success('Filtros obtenidos correctamente.', [
            'areas' => Area::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name']),
            'places' => Place::query()
                ->where('is_active', true)
                ->with('areas:id')
                ->orderBy('name')
                ->get(['id', 'name', 'city'])
                ->map(fn(Place $place) => [
                    'id' => $place->id,
                    'name' => $place->name,
                    'city' => $place->city,
                    'area_ids' => $place->areas->pluck('id')->values(),
                ]),
            'modalities' => [
                ['value' => 'on_site', 'label' => 'Presencial'],
                ['value' => 'remote', 'label' => 'Remoto'],
                ['value' => 'hybrid', 'label' => 'Híbrido'],
            ],
        ]);
    }

    public function areas(): JsonResponse
    {
        $areas = Area::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return $this->success('Áreas listadas correctamente.', $areas);
    }

    public function areaPlaces(string $areaId): JsonResponse
    {
        $places = Place::query()
            ->where('is_active', true)
            ->whereHas('areas', fn($q) => $q->where('areas.id', $areaId)->where('areas.is_active', true))
            ->orderBy('name')
            ->get(['id', 'name', 'city']);

        return $this->success('Sedes por área listadas correctamente.', $places);
    }

    public function areaOffers(Request $request, string $areaId): JsonResponse
    {
        $filters = [
            ...$request->only(['q', 'search', 'location', 'modality', 'place_id']),
            'area_id' => $areaId,
        ];

        $offers = $this->jobService->paginate($filters, (int) $request->input('per_page', 10), true);

        return response()->json([
            'success' => true,
            'message' => 'Puestos por área listados correctamente.',
            'data' => JobResource::collection($offers),
            'meta' => [
                'current_page' => $offers->currentPage(),
                'last_page' => $offers->lastPage(),
                'per_page' => $offers->perPage(),
                'total' => $offers->total(),
                'has_more_pages' => $offers->hasMorePages(),
                'next_page_url' => $offers->nextPageUrl(),
            ],
        ]);
    }

    public function areaPlaceOffers(Request $request, string $areaId, string $placeId): JsonResponse
    {
        $filters = [
            ...$request->only(['q', 'search', 'location', 'modality']),
            'area_id' => $areaId,
            'place_id' => $placeId,
        ];

        $offers = $this->jobService->paginate($filters, (int) $request->input('per_page', 10), true);

        return response()->json([
            'success' => true,
            'message' => 'Puestos por área y sede listados correctamente.',
            'data' => JobResource::collection($offers),
            'meta' => [
                'current_page' => $offers->currentPage(),
                'last_page' => $offers->lastPage(),
                'per_page' => $offers->perPage(),
                'total' => $offers->total(),
                'has_more_pages' => $offers->hasMorePages(),
                'next_page_url' => $offers->nextPageUrl(),
            ],
        ]);
    }

    public function offerDetail(string $slug): JsonResponse
    {
        $offer = $this->jobService->findBySlug($slug, true);

        return $this->success(
            'Detalle de oferta obtenido correctamente.',
            new JobResource($offer),
        );
    }

    public function apply(StoreApplicationRequest $request): JsonResponse
    {
        $application = $this->applicationService->create(
            ApplicationData::fromArray($request->validated()),
        );

        return $this->created(
            '¡Postulación recibida! Tu CV fue enviado correctamente.',
            new ApplicationResource($application),
        );
    }
}
