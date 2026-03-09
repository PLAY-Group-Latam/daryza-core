<?php

namespace App\Http\Web\Services\JobsPortal;

use App\Http\Web\DTO\JobsPortal\ApplicationData;
use App\Models\JobsPortal\Application;
use App\Models\JobsPortal\Job;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use App\Jobs\SendEmailJob;
use App\Mail\Job\JobsRequest as JobsRequestMail;
use App\Models\Leads\Lead;
use Illuminate\Support\Facades\Log;


class ApplicationService
{
    public function __construct(private readonly ApplicationCvStorageService $cvStorageService) {}

    public function paginate(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return Application::query()
            ->with('job')
            ->byEmail($filters['email'] ?? null)
            ->when(isset($filters['job_id']), fn($q) => $q->where('job_id', $filters['job_id']))
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    public function create(ApplicationData $data): Application
    {
        return DB::transaction(function () use ($data) {
            Job::query()->findOrFail($data->jobId);

            $cvPath = $this->cvStorageService->store($data->cv, $data->jobId);

            $application = Application::create([
                'first_name' => $data->firstName,
                'last_name'  => $data->lastName,
                'email'      => $data->email,
                'phone'      => $data->phone,
                'cv_path'    => $cvPath,
                'job_id'     => $data->jobId,
            ])->load('job.area', 'job.place');

            $adminEmail = config('emails.contact_recipients.' . Lead::TYPE_WORK_WITH_US);

            if ($adminEmail) {
                SendEmailJob::dispatch(
                    new JobsRequestMail($application->toArray()),
                    $adminEmail
                );
            }

            return $application;
        });
    }

    public function delete(Application $application): void
    {
        $application->delete();
    }
}
