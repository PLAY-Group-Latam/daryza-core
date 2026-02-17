<?php

namespace App\Http\Api\v1\Services\Leads;

use App\Models\Leads\Lead;
use Illuminate\Http\UploadedFile;
use App\Http\Api\v1\Services\GcsService;
use Illuminate\Support\Facades\DB;

class JobsService
{
    protected GcsService $gcsService;

    public function __construct(GcsService $gcsService)
    {
        $this->gcsService = $gcsService;
    }

    public function save(array $data): Lead
    {
        return DB::transaction(function () use ($data) {
            $type = Lead::TYPE_WORK_WITH_US; 

            $payload = [
                'type'      => $type,
                'full_name' => ($data['firstName'] ?? '') . ' ' . ($data['lastName'] ?? ''),
                'email'     => $data['email'],
                'phone'     => $data['phone'] ?? null,
                'status'    => Lead::STATUS_NEW,
                'data'      => $this->mapJsonFields($data),
            ];

            if (isset($data['cv']) && $data['cv'] instanceof UploadedFile) {
                $folder = "leads/work-with-us";
                $publicUrl = $this->gcsService->uploadFile($data['cv'], $folder);

                $payload['file_path'] = $publicUrl;
                $payload['file_original_name'] = $data['cv']->getClientOriginalName();
            }

            return Lead::create($payload);
        });
    }

    
    protected function mapJsonFields(array $data): array
    {
        return [
            'created_at_form'  => now()->toDateTimeString(),
            'firstName'        => $data['firstName'] ?? null,
            'lastName'         => $data['lastName'] ?? null,
            'area'             => $data['area'] ?? null,
            'position'         => $data['position'] ?? null,
            'location'         => $data['location'] ?? null,
            'employmentStatus' => $data['employmentStatus'] ?? null,
            'acceptedPolicy'   => isset($data['acceptedPolicy']) ? (bool)$data['acceptedPolicy'] : false,
        ];
    }
}