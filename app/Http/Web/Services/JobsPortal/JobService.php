<?php

namespace App\Http\Web\Services\JobsPortal;

use App\Enums\OgType;
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

        $metaTitle = $this->limitNullableString($metadata['meta_title'] ?? null, 160)
            ?? $this->limitNullableString($job->title, 160);
        $metaDescription = $this->limitNullableString($metadata['meta_description'] ?? null, 320)
            ?? $this->limitNullableString($job->description, 320);
        $canonicalUrl = $this->limitNullableString($metadata['canonical_url'] ?? null, 500)
            ?? (config('app.frontend_url') . '/trabajos/' . $job->slug);
        $ogType = $this->resolveOgType($metadata['og_type'] ?? null);

        $job->metadata()->updateOrCreate(
            [
                'metadatable_id' => $job->id,
                'metadatable_type' => Job::class,
            ],
            [
                'meta_title' => $metaTitle,
                'meta_description' => $metaDescription,
                'og_title' => $metaTitle,
                'og_description' => $metaDescription,
                'og_type' => $ogType,
                'canonical_url' => $canonicalUrl,
                'noindex' => (bool) ($metadata['noindex'] ?? false),
                'nofollow' => (bool) ($metadata['nofollow'] ?? false),
            ],
        );
    }

    private function limitNullableString(mixed $value, int $max): ?string
    {
        if ($value === null) {
            return null;
        }

        $text = trim((string) $value);
        if ($text === '') {
            return null;
        }

        return function_exists('mb_substr')
            ? mb_substr($text, 0, $max)
            : substr($text, 0, $max);
    }

    private function resolveOgType(mixed $value): string
    {
        $normalized = $this->limitNullableString($value, 50);
        if ($normalized === null) {
            return OgType::ARTICLE->value;
        }

        $allowed = array_column(OgType::cases(), 'value');
        return in_array($normalized, $allowed, true)
            ? $normalized
            : OgType::ARTICLE->value;
    }
}
