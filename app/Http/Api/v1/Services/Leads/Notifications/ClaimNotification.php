<?php

namespace App\Http\Api\v1\Services\Leads\Notifications;

use App\Models\Leads\Lead;
use App\Mail\ComplaintsBook\ComplaintToDaryza;
use App\Mail\ComplaintsBook\ComplaintsBookRequest;
use App\Http\Api\v1\Services\Mail\MailService;
use App\Jobs\SendEmailJob;

class ClaimNotification
{
   

  public function notify(Lead $lead): void
{
    $adminEmail = config('leads.claim_admin_email');

    SendEmailJob::dispatch(
        new ComplaintToDaryza($lead->toArray()),
        $adminEmail
    );

    SendEmailJob::dispatch(
        new ComplaintsBookRequest($lead->toArray()),
        $lead->email
    );
}
}