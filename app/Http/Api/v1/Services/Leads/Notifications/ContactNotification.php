<?php

namespace App\Http\Api\v1\Services\Leads\Notifications;

use App\Models\Leads\Lead;
use App\Mail\Contact\ContactToDaryza; 
use App\Http\Api\v1\Services\Mail\MailService;
use App\Jobs\SendEmailJob;

class ContactNotification
{
   

    public function notify(Lead $lead): void
{
    $adminEmail = $this->resolveAdminEmail($lead->type);

    if (!$adminEmail) {
        return;
    }

    SendEmailJob::dispatch(
        new ContactToDaryza($lead->toArray()),
        $adminEmail
    );
}

    protected function resolveAdminEmail(string $type): ?string
    {
        return config("leads.contact_recipients.$type");
    }
}