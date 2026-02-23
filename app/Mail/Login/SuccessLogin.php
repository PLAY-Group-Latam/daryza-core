<?php

namespace App\Mail\Login;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SuccessLogin extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public string $username) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(config('mail.from.address'), config('mail.from.name')),
            subject: 'Inicio de sesión exitoso',
        );
    }

    public function content(): Content
    {

        return new Content(
            view: 'mail.login.success-login',
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
