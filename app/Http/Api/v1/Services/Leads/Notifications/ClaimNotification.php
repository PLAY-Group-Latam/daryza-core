<?php

namespace App\Http\Api\v1\Services\Leads\Notifications;

use App\Models\Leads\Lead;
use App\Mail\ComplaintsBook\ComplaintToDaryza;
use App\Mail\ComplaintsBook\ComplaintsBookRequest;
use App\Jobs\SendEmailJob;

class ClaimNotification
{
   

  public function notify(Lead $lead): void
{
    $adminEmail = config('emails.claim_admin_email');

    if (!$adminEmail) {
        return; 
    }

    SendEmailJob::dispatch(
        new ComplaintToDaryza($lead->toArray()),
        $adminEmail
    );

    if ($lead->email) {
        SendEmailJob::dispatch(
            new ComplaintsBookRequest($lead->toArray()),
            $lead->email
        );
    }
}
}