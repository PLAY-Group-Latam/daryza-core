<?php

namespace App\Http\Web\DTO\JobsPortal;

use Illuminate\Http\UploadedFile;

readonly class ApplicationData
{
    public function __construct(
        public string $firstName,
        public string $lastName,
        public string $email,
        public string $phone,
        public UploadedFile $cv,
        public string $jobId,
    ) {
    }

    public static function fromArray(array $data): self
    {
        return new self(
            firstName: $data['first_name'],
            lastName: $data['last_name'],
            email: $data['email'],
            phone: $data['phone'],
            cv: $data['cv'],
            jobId: $data['job_id'],
        );
    }
}
