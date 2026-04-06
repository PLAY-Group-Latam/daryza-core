<?php

namespace App\Http\Api\v1\Services\Leads;

use App\Models\Leads\Lead;
use Illuminate\Http\UploadedFile;
use App\Http\Api\v1\Services\GcsService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class ClaimService
{
    protected LeadNotificationService $leadNotificationService;
    protected GcsService $gcsService;
    
    public function __construct(GcsService $gcsService, LeadNotificationService $leadNotificationService)
    {
        $this->gcsService = $gcsService;
        $this->leadNotificationService = $leadNotificationService;
    }

    public function save(array $data): Lead
    {
        $claimsCount = Lead::where('type', Lead::TYPE_CLAIM)->count();
        $nextCorrelative = Str::padLeft($claimsCount + 1, 5, '0');
        $timestamp = Carbon::now('America/Lima')->format('dmY-His'); 
        
        $claimCode = "{$nextCorrelative}-{$timestamp}";

        $payload = [
            'type'      => Lead::TYPE_CLAIM,
            'full_name' => $data['name'],
            'email'     => $data['email'],
            'phone'     => $data['phone_number'],
            'status'    => Lead::STATUS_NEW, 
            'data'      => $this->mapJsonFields($data, $claimCode),
        ];

        if (isset($data['file_attached']) && $data['file_attached'] instanceof UploadedFile) {
            $folder = 'leads/claims';
            $publicUrl = $this->gcsService->uploadFile($data['file_attached'], $folder);

            $payload['file_path'] = $publicUrl;
            $payload['file_original_name'] = $data['file_attached']->getClientOriginalName();
        }

        $lead = Lead::create($payload);
        
        $this->leadNotificationService->notify($lead);

        return $lead;
    }

    protected function mapJsonFields(array $data, string $claimCode): array
    {
        return [
            'claim_code'         => $claimCode,
            'document_type_id'   => $data['document_type_id'],
            'document_number'    => $data['document_number'],
            'address'            => $data['address'],
            'district'           => $data['district'],
            'well_hired_id'      => $data['well_hired_id'],
            'type_of_service_id' => $data['type_of_service_id'],
            'type_of_claim_id'   => $data['type_of_claim_id'],
            'description'        => $data['description'],
            'terms_conditions'   => $data['terms_conditions'],
            'created_at_form'    => now()->toDateTimeString(),
        ];
    }
}