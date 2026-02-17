<?php

namespace App\Http\Api\v1\Services\Leads;

use App\Models\Leads\Lead;

class AboutUsService
{
   
    public function save(array $data): Lead
    {
       
        $fullName = trim(($data['fullName'] ?? '') . ' ' . ($data['lastName'] ?? ''));

        $payload = [
            'type'      => Lead::TYPE_ABOUT_US,
            'full_name' => $fullName,
            'email'     => $data['email'],
            'phone'     => $data['phone'] ?? null,
            'status'    => Lead::STATUS_NEW,
            'data'      => $this->mapJsonFields($data),
        ];

        return Lead::create($payload);
    }

    protected function mapJsonFields(array $data): array
    {
        return [
            'first_name'      => $data['fullName'] ?? null,
            'last_name'       => $data['lastName'] ?? null,
            'company_name'    => $data['companyName'] ?? null,
            'ruc_or_dni'      => $data['rucOrDni'] ?? null,
            'comments'        => $data['comments'] ?? null,
            'created_at_form' => now()->toDateTimeString(),
        ];
    }
}