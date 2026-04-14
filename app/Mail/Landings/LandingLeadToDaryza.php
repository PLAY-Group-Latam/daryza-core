<?php

namespace App\Mail\Landings;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LandingLeadToDaryza extends Mailable
{
    use Queueable, SerializesModels;

    public object $lead;
    public object $landing;
    public ?string $adminUrl;

    public function __construct(array $leadData, array $landingData, ?string $adminUrl = null)
    {
        $this->lead = (object) $leadData;
        $this->landing = (object) $landingData;
        $this->adminUrl = $adminUrl;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(config('mail.from.address'), config('mail.from.name')),
            subject: 'Nuevo Lead de Landing - Daryza',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.landing-leads.to-daryza',
            with: [
                'lead' => $this->lead,
                'landing' => $this->landing,
                'adminUrl' => $this->adminUrl,
            ]
        );
    }
}

