<?php

namespace App\Mail\Login;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SuccessSignUp extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(private string $username) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(config('mail.from.address'), config('mail.from.name')),
            subject: 'Registro exitoso',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.login.success-sign-up',
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
