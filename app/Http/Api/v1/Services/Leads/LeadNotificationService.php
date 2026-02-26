<?php

namespace App\Http\Api\v1\Services\Leads;

use App\Models\Leads\Lead;
use App\Http\Api\v1\Services\Leads\Notifications\ContactNotification;
use App\Http\Api\v1\Services\Leads\Notifications\ClaimNotification;

class LeadNotificationService
{
    protected ContactNotification $contactNotification;
    protected ClaimNotification $claimNotification;

    public function __construct(
        ContactNotification $contactNotification,
        ClaimNotification $claimNotification
    ) {
        $this->contactNotification = $contactNotification;
        $this->claimNotification   = $claimNotification;
    }

    public function notify(Lead $lead): void
    {
        if ($lead->type === Lead::TYPE_CLAIM) {
            $this->claimNotification->notify($lead);
            return;
        }
        
        $this->contactNotification->notify($lead);
    }
}