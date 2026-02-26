<?php

namespace App\Http\Api\v1\Services\Leads\Notifications;

use App\Models\Leads\Lead;
use App\Mail\Contact\ContactToDaryza; 
use App\Http\Api\v1\Services\Mail\MailService;

class ContactNotification
{
    protected MailService $mailService;

    public function __construct(MailService $mailService)
    {
        $this->mailService = $mailService;
    }

    public function notify(Lead $lead): void
    {
        $adminEmail = $this->resolveAdminEmail($lead->type);

        if (!$adminEmail) {
            return;
        }

        $this->mailService
            ::to($adminEmail)
            ->send(new ContactToDaryza($lead->toArray()));
    }

    protected function resolveAdminEmail(string $type): ?string
    {
        return config("leads.contact_recipients.$type");
    }
}