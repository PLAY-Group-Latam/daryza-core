<?php

namespace App\Http\Api\v1\Services\Landings;

use App\Jobs\SendEmailJob;
use App\Mail\Landings\LandingLeadCustomerReply;
use App\Mail\Landings\LandingLeadToDaryza;
use App\Models\Landings\Landing;
use App\Models\Landings\LandingLead;

class LandingLeadNotificationService
{
    public function notify(LandingLead $lead, Landing $landing): void
    {
        $adminEmail = config('emails.landing_leads.admin_email');
        $attentionSchedule = (string) config('emails.landing_leads.attention_schedule');
        $adminUrl = $this->resolveAdminUrl($landing);

        $leadPayload = $lead->toArray();
        $landingPayload = [
            'id' => $landing->id,
            'title' => $landing->title,
            'slug' => $landing->slug,
        ];

        if (!empty($lead->email)) {
            SendEmailJob::dispatch(
                new LandingLeadCustomerReply($leadPayload, $landingPayload, $attentionSchedule),
                $lead->email
            );
        }

        if (!empty($adminEmail)) {
            SendEmailJob::dispatch(
                new LandingLeadToDaryza($leadPayload, $landingPayload, $adminUrl),
                $adminEmail
            );
        }
    }

    private function resolveAdminUrl(Landing $landing): string
    {
        $baseUrl = rtrim((string) config('app.url'), '/');
        return "{$baseUrl}/landings/items/{$landing->id}/leads";
    }
}
