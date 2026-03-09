<?php

namespace App\Mail\Job;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class JobsRequest extends Mailable {

    public object $JobsRequest;
    use Queueable, SerializesModels;

    public function __construct(array $JobsRequest) {
        $this->JobsRequest = (object) $JobsRequest;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(config('mail.from.address'), config('mail.from.name')),
            subject: 'Recibimos tu postulación',

        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.jobs.to-daryza-jobs',
            with: [
                'JobsRequest' => $this->JobsRequest,
            ]
        );
    }
}

