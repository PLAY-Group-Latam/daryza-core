<?php

namespace App\Mail\Contact;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactToDaryza extends Mailable {

    public object $complaintsBook;
    use Queueable, SerializesModels;

    public function __construct(array $complaintsBook) {
        $this->complaintsBook = (object) $complaintsBook;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(config('mail.from.address'), config('mail.from.name')),
            subject: 'Nuevo Lead de Contacto',

        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.contact.to-daryza-contact',
            with: [
                'complaintsBook' => $this->complaintsBook,
            ]
        );
    }
}


