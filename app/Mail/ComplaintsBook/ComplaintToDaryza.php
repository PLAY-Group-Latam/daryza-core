<?php

namespace App\Mail\ComplaintsBook;

use Illuminate\Bus\Queueable;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ComplaintToDaryza extends Mailable
{

    public object $complaintsBook;
    use Queueable, SerializesModels;

    public function __construct(array $complaintsBook)
    {
        $this->complaintsBook = (object) $complaintsBook;
    }

    public function envelope(): Envelope
    {
        $data = $this->complaintsBook->data ?? [];

        // Si 'data' es un array dentro del objeto:
        $claimCode = is_array($data) ? ($data['claim_code'] ?? 'S/N') : ($data->claim_code ?? 'S/N');

        return new Envelope(
            from: new Address(config('mail.from.address'), config('mail.from.name')),
            subject: "Libro de Reclamaciones Daryza | Reclamo #{$claimCode}",
        );
    }
    public function content(): Content
    {
        return new Content(
            view: 'mail.complaints-book.to-daryza-complaints-book',
            with: [
                'complaintsBook' => $this->complaintsBook,
            ]
        );
    }
}
