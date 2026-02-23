<?php

namespace App\Mail\ResetPassword;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RecoveryPassword extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public string $email, public string $url) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(config('mail.from.address'), config('mail.from.name')),
            subject: 'Recuperación de contraseña',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.reset-password.recovery-password',
            with: [
                'email' => $this->email,
                'url' => $this->url,
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
