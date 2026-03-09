<?php

namespace App\Http\Web\Services\JobsPortal;

use App\Http\Web\DTO\JobsPortal\JobData;
use App\Http\Web\Services\GcsService;
use App\Models\JobsPortal\Job;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class JobService
{
    public function __construct(private readonly GcsService $gcsService)
    {
    }

    public function paginate(array $filters, int $perPage = 15, bool $onlyActive = false): LengthAwarePaginator
    {
        $searchTerm = $filters['search'] ?? $filters['q'] ?? null;

        $query = Job::query()
            ->with(['area', 'place', 'metadata'])
            ->search($searchTerm)
            ->byArea($filters['area_id'] ?? null)
            ->byPlace($filters['place_id'] ?? null)
            ->byLocation($filters['location'] ?? null)
            ->byModality($filters['modality'] ?? null)
            ->byIsActive($filters['is_active'] ?? null);

        if ($onlyActive) {
            $query->publicVisible();
        }

        return $query->latest()->paginate($perPage)->withQueryString();
    }

    public function create(JobData $data): Job
    {
        $payload = $data->toArray();

        if ($data->image) {
            $payload['image_url'] = $this->gcsService->uploadFile(
                $data->image,
                'jobs-portal/offers/images',
            );
        }

        $job = Job::create($payload);
        $this->syncMetadata($job, $data->metadata);

        return $job->load(['area', 'place', 'metadata']);
    }

    public function update(Job $job, JobData $data): Job
    {
        $payload = $data->toArray();

        if ($data->image) {
            if ($job->image_url) {
                $this->gcsService->deleteFromPublicUrl($job->image_url);
            }

            $payload['image_url'] = $this->gcsService->uploadFile(
                $data->image,
                'jobs-portal/offers/images',
            );
        }

        $job->update($payload);
        $this->syncMetadata($job, $data->metadata);

        return $job->refresh()->load(['area', 'place', 'metadata']);
    }

    public function delete(Job $job): void
    {
        if ($job->image_url) {
            $this->gcsService->deleteFromPublicUrl($job->image_url);
        }

        $job->delete();
    }

    public function findBySlug(string $slug, bool $onlyActive = false): Job
    {
        $query = Job::query()
            ->with(['area', 'place', 'metadata'])
            ->where('slug', $slug);

        if ($onlyActive) {
            $query->publicVisible();
        }

        return $query->firstOrFail();
    }

    protected function syncMetadata(Job $job, array $metadata): void
    {
        if ($metadata === []) {
            return;
        }

        $job->metadata()->updateOrCreate(
            [
                'metadatable_id' => $job->id,
                'metadatable_type' => Job::class,
            ],
            [
                'meta_title' => $metadata['meta_title'] ?? $job->title,
                'meta_description' => $metadata['meta_description'] ?? $job->description,
                'canonical_url' => $metadata['canonical_url'] ?? (config('app.frontend_url') . '/trabajos/' . $job->slug),
                'noindex' => (bool) ($metadata['noindex'] ?? false),
                'nofollow' => (bool) ($metadata['nofollow'] ?? false),
            ],
        );
    }
}
