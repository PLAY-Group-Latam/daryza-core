<?php

namespace App\Http\Web\Services\JobsPortal;

use App\Http\Web\DTO\JobsPortal\JobData;
use App\Models\JobsPortal\Job;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class JobService
{
    public function paginate(array $filters, int $perPage = 15, bool $onlyActive = false): LengthAwarePaginator
    {
        $query = Job::query()
            ->with(['area', 'place'])
            ->search($filters['search'] ?? null)
            ->byArea($filters['area_id'] ?? null)
            ->byPlace($filters['place_id'] ?? null)
            ->byModality($filters['modality'] ?? null)
            ->byIsActive($filters['is_active'] ?? null);

        if ($onlyActive) {
            $query->active();
        }

        return $query->latest()->paginate($perPage)->withQueryString();
    }

    public function create(JobData $data): Job
    {
        return Job::create($data->toArray())->load(['area', 'place']);
    }

    public function update(Job $job, JobData $data): Job
    {
        $job->update($data->toArray());

        return $job->refresh()->load(['area', 'place']);
    }

    public function delete(Job $job): void
    {
        $job->delete();
    }

    public function findBySlug(string $slug, bool $onlyActive = false): Job
    {
        $query = Job::query()
            ->with(['area', 'place'])
            ->where('slug', $slug);

        if ($onlyActive) {
            $query->active();
        }

        return $query->firstOrFail();
    }
}
