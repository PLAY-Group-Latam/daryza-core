<?php

namespace App\Mail\ComplaintsBook;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ComplaintsBookRequest extends Mailable {

    public object $complaintsBook;
    use Queueable, SerializesModels;

    public function __construct(array $complaintsBook) {
        $this->complaintsBook = (object) $complaintsBook;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(config('mail.from.address'), config('mail.from.name')),
            subject: 'Recibimos tu reclamo',

        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.complaints-book.complaints-book',
            with: [
                'complaintsBook' => $this->complaintsBook,
            ]
        );
    }
}

