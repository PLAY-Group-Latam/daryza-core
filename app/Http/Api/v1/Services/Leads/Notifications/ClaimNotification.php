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

        Log::info('[ClaimNotification] Iniciando notificación', [
            'lead_id'     => $lead->id,
            'lead_email'  => $lead->email,
            'admin_email' => $adminEmail,
            'lead_type'   => $lead->type,
        ]);

        // --- Correo al Admin ---
        try {
            Log::info('[ClaimNotification] Enviando correo al ADMIN', [
                'to' => $adminEmail,
            ]);

            $this->mailService
                ::to($adminEmail)
                ->send(new ComplaintToDaryza($lead->toArray()));

            Log::info('[ClaimNotification] Correo al ADMIN enviado OK');

        } catch (\Throwable $e) {
            Log::error('[ClaimNotification] ERROR enviando correo al ADMIN', [
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);
        }

        // --- Correo al Usuario ---
        try {
            Log::info('[ClaimNotification] Enviando correo al USUARIO', [
                'to' => $lead->email,
            ]);

            $this->mailService
                ::to($lead->email)
                ->send(new ComplaintsBookRequest($lead->toArray()));

            Log::info('[ClaimNotification] Correo al USUARIO enviado OK');

        } catch (\Throwable $e) {
            Log::error('[ClaimNotification] ERROR enviando correo al USUARIO', [
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);
        }
    }
}