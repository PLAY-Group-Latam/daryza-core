<?php

namespace App\Mail\ResetPassword;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SuccessReset extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public string $username) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(config('mail.from.address'), config('mail.from.name')),
            subject: 'Cambio de contraseña exitoso',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.reset-password.success-reset',
            with: [
                'username' => $this->username,
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
