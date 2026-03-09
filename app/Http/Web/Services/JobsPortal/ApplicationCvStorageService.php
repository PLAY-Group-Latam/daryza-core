<?php

namespace App\Http\Web\Services\JobsPortal;

use App\Http\Web\Services\GcsService;
use Illuminate\Http\UploadedFile;

class ApplicationCvStorageService
{
    public function __construct(private readonly GcsService $gcsService)
    {
    }

    public function store(UploadedFile $file, ?string $jobId = null): string
    {
        $originalName = basename($file->getClientOriginalName());
        $directory = $jobId
            ? "jobs-portal/applications/cv/{$jobId}"
            : 'jobs-portal/applications/cv';

        return $this->gcsService->uploadFile($file, $directory, $originalName);
    }
}
