<?php

namespace App\Http\Api\v1\Services\Leads\Notifications;

use App\Models\Leads\Lead;
use App\Mail\ComplaintsBook\ComplaintToDaryza;
use App\Mail\ComplaintsBook\ComplaintsBookRequest;
use App\Jobs\SendEmailJob;
use App\Models\Settings\DestinationEmail;
use App\Services\Mail\DestinationEmailResolver;

class ClaimNotification
{
  public function __construct(private readonly DestinationEmailResolver $destinationEmailResolver) {}

  public function notify(Lead $lead): void
{
    $adminEmail = $this->destinationEmailResolver->resolve(DestinationEmail::PAGE_CLAIMS);

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
