<?php

namespace App\Mail\Landings;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LandingLeadCustomerReply extends Mailable
{
    use Queueable, SerializesModels;

    public object $lead;
    public object $landing;
    public string $attentionSchedule;

    public function __construct(array $leadData, array $landingData, string $attentionSchedule)
    {
        $this->lead = (object) $leadData;
        $this->landing = (object) $landingData;
        $this->attentionSchedule = $attentionSchedule;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(config('mail.from.address'), config('mail.from.name')),
            subject: 'Gracias por tu información - Daryza',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.landing-leads.customer-reply',
            with: [
                'lead' => $this->lead,
                'landing' => $this->landing,
                'attentionSchedule' => $this->attentionSchedule,
            ]
        );
    }
}

