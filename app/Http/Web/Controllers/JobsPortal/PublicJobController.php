<?php

namespace App\Http\Web\Controllers\JobsPortal;

use App\Http\Web\Controllers\Controller;
use App\Http\Web\DTO\JobsPortal\ApplicationData;
use App\Http\Web\Requests\JobsPortal\StoreApplicationRequest;
use App\Http\Web\Resources\JobsPortal\ApplicationResource;
use App\Http\Web\Resources\JobsPortal\JobResource;
use App\Http\Web\Services\JobsPortal\ApplicationService;
use App\Http\Web\Services\JobsPortal\JobService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicJobController extends Controller
{
    public function __construct(
        private readonly JobService $jobService,
        private readonly ApplicationService $applicationService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'area_id', 'place_id', 'modality']);
        $jobs = $this->jobService->paginate($filters, (int) $request->input('per_page', 15), true);

        return response()->json([
            'data' => JobResource::collection($jobs),
            'meta' => [
                'current_page' => $jobs->currentPage(),
                'last_page' => $jobs->lastPage(),
                'per_page' => $jobs->perPage(),
                'total' => $jobs->total(),
            ],
        ]);
    }

    public function show(string $slug): JobResource
    {
        return new JobResource($this->jobService->findBySlug($slug, true));
    }

    public function apply(StoreApplicationRequest $request): ApplicationResource
    {
        $application = $this->applicationService->create(ApplicationData::fromArray($request->validated()));

        return new ApplicationResource($application);
    }
}
