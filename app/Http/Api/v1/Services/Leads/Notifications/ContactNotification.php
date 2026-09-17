<?php

namespace App\Http\Api\v1\Services\Leads\Notifications;

use App\Models\Leads\Lead;
use App\Mail\Contact\ContactToDaryza; 
use App\Jobs\SendEmailJob;
use App\Models\Settings\DestinationEmail;
use App\Services\Mail\DestinationEmailResolver;

class ContactNotification
{
    public function __construct(private readonly DestinationEmailResolver $destinationEmailResolver) {}

    public function notify(Lead $lead): void
{
    $adminEmail = $this->resolveAdminEmail($lead->type);

    SendEmailJob::dispatch(
        new ContactToDaryza($lead->toArray()),
        $adminEmail
    );
}

    protected function resolveAdminEmail(string $type): string
    {
        $pageKey = match ($type) {
            Lead::TYPE_HELP_CENTER => DestinationEmail::PAGE_CONTACT_HELP_CENTER,
            Lead::TYPE_DISTRIBUTOR => DestinationEmail::PAGE_CONTACT_DISTRIBUTOR,
            Lead::TYPE_ADVISOR => DestinationEmail::PAGE_CONTACT_ADVISOR,
            Lead::TYPE_CUSTOMER_SERVICE => DestinationEmail::PAGE_CONTACT_CUSTOMER_SERVICE,
            Lead::TYPE_ABOUT_US => DestinationEmail::PAGE_ABOUT_US,
            Lead::TYPE_WORK_WITH_US => DestinationEmail::PAGE_WORK_WITH_US,
            default => null,
        };

        if (!$pageKey) {
            throw new \InvalidArgumentException("Tipo de lead sin correo destino configurado: {$type}");
        }

        return $this->destinationEmailResolver->resolve($pageKey);
    }
}
