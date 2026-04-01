<?php

namespace App\Http\Api\v1\Services\Landings;

use App\Models\Landings\Landing;
use App\Models\Landings\LandingLead;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class LandingLeadService
{
    public function save(string $slug, array $data, string $ipAddress, ?string $userAgent): LandingLead
    {
        $landing = Landing::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (!$landing) {
            throw new ModelNotFoundException('Landing no encontrada o inactiva.');
        }

        return LandingLead::query()->create([
            'landing_id' => $landing->id,
            'form_key' => $data['form_key'] ?? 'advisor_form',
            'campaign_key' => null,
            'full_name' => $data['full_name'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'data' => [
                'ruc_or_dni' => $data['ruc_or_dni'],
                'company_name' => $data['company_name'],
                'comments' => $data['comments'] ?? null,
            ],
            'source_data' => $data['source_data'] ?? null,
            'page_url' => $data['page_url'] ?? null,
            'referrer' => $data['referrer'] ?? null,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
        ]);
    }
}
