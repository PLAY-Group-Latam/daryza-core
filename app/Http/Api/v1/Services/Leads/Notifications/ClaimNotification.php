<?php

namespace App\Http\Api\v1\Services\Leads\Notifications;

use App\Models\Leads\Lead;
use App\Mail\ComplaintsBook\ComplaintToDaryza;
use App\Mail\ComplaintsBook\ComplaintsBookRequest;
use App\Http\Api\v1\Services\Mail\MailService;
use Illuminate\Support\Facades\Log;

class ClaimNotification
{
    protected MailService $mailService;

    public function __construct(MailService $mailService)
    {
        $this->mailService = $mailService;
    }

   public function notify(Lead $lead): void
    {
        $adminEmail = config('leads.claim_admin_email');

        try {
            $this->mailService
                ::to($adminEmail)
                ->send(new ComplaintToDaryza($lead->toArray()));
        } catch (\Throwable $e) {
        }

        try {
            $this->mailService
                ::to($lead->email)
                ->send(new ComplaintsBookRequest($lead->toArray()));
        } catch (\Throwable $e) {
        }
    }
}