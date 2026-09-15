<?php

namespace App\Http\Api\v1\Services\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class MailService
{
    protected string $to;

    /**
     * Define el destinatario.
     */
    public static function to(string $email): self
    {
        $instance = new self;
        $instance->to = $email;

        return $instance;
    }

    /**
     * Envía el mailable usando el driver configurado (Mailgun/Log/etc).
     */
    public function send(Mailable $mailable): void
    {
        try {
           
            Mail::to($this->to)->send($mailable);
        } catch (\Throwable $e) {
            Log::error("Error en MailService: {$e->getMessage()}", [
                'to' => $this->to,
                'mailable' => get_class($mailable)
            ]);


            throw $e;
        }
    }

    /**
     * Envía múltiples mailables.
     */
    public function sendMany(array $mailables): void
    {
        foreach ($mailables as $mailable) {
            $this->send($mailable);
        }
    }
}