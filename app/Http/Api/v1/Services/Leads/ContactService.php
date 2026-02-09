<?php

namespace App\Http\Api\v1\Services\Leads;

use App\Models\Leads\Lead;
use Illuminate\Http\UploadedFile;
use App\Http\Api\v1\Services\GcsService;

class ContactService
{
    protected GcsService $gcsService;

    public function __construct(GcsService $gcsService)
    {
        $this->gcsService = $gcsService;
    }

    public function save(array $data): Lead
    {
        $type = $data['type'];
        
        $payload = [
            'type'       => $type,
            'full_name'  => $data['full_name'],
            'email'      => $data['email'],
            'phone'      => $data['phone'] ?? null,
            'status'     => Lead::STATUS_NEW,
            'data'       => $this->mapJsonFieldsByType($data),
        ];

        
        if (isset($data['file_attached']) && $data['file_attached'] instanceof UploadedFile) {
        
            $folder = "leads/{$type}";
            $publicUrl = $this->gcsService->uploadFile($data['file_attached'], $folder);

            $payload['file_path'] = $publicUrl;
            $payload['file_original_name'] = $data['file_attached']->getClientOriginalName();
        }

        return Lead::create($payload);
    }

   protected function mapJsonFieldsByType(array $data): array
{
    $base = ['created_at_form' => now()->toDateTimeString()];

    return match ($data['type']) {
        Lead::TYPE_HELP_CENTER => array_merge($base, [
            'contact_reason'    => $data['contact_reason'] ?? null,
            'purchase_document' => $data['purchase_document'] ?? null,
            'ruc_or_dni'        => $data['ruc_or_dni'] ?? null,
            'purchase_date'     => $data['purchase_date'] ?? null,
            'comments'          => $data['comments'] ?? null,
        ]),
        
        // AGREGA ESTO:
        Lead::TYPE_ADVISOR => array_merge($base, [
            'ruc_or_dni'   => $data['ruc_or_dni'] ?? null,
            'company_name' => $data['company_name'] ?? null,
            'province'     => $data['province'] ?? null,
            'comments'     => $data['comments'] ?? null,
        ]),

        Lead::TYPE_DISTRIBUTOR => array_merge($base, [
            'company_name'      => $data['company_name'] ?? null,
            'ruc_or_dni'        => $data['ruc_or_dni'] ?? null,
            'number_of_sellers' => $data['number_of_sellers'] ?? null,
            'address'           => $data['address'] ?? null,
            'department'        => $data['department'] ?? null,
            'district'          => $data['district'] ?? null,
            'province'          => $data['province'] ?? null,
            'other_products'    => $data['other_products'] ?? null,
            'comments'          => $data['comments'] ?? null,
        ]),

        Lead::TYPE_CUSTOMER_SERVICE => array_merge($base, [
            'ruc_or_dni'               => $data['ruc_or_dni'] ?? null,
            'purchase_document_number' => $data['purchase_document_number'] ?? null,
            'comments'                 => $data['comments'] ?? null,
        ]),
 
        default => $base,
    };
}
}