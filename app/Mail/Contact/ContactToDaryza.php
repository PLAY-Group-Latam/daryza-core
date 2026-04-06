<?php

namespace App\Mail\Contact;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactToDaryza extends Mailable {

    use Queueable, SerializesModels;

    // Cambiamos el nombre para que sea semántico
    public object $contact;

    public function __construct(array $contactData) {
        // Convertimos a objeto para acceder con -> en el Blade
        $this->contact = (object) $contactData;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(config('mail.from.address'), config('mail.from.name')),
            subject: 'Nuevo Lead de Contacto - Daryza',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.contact.to-daryza-contact',
            with: [
                'contact' => $this->contact,
            ]
        );
    }
}