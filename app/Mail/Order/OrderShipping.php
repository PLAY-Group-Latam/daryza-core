<?php

namespace App\Mail\Order;

use App\Models\LayoutSections;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderShipping extends Mailable
{
    use Queueable, SerializesModels;


    public function __construct(private Order $order) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(config('mail.from.address'), config('mail.from.name')),
            subject: 'Tu pedido ' . $this->order->purchase_number . ' está en camino hoy',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.order.4-in-route',
            with: [
                'customer' => $this->order->contact->full_name,
                'purchase_number' => $this->order->purchase_number,
            ],
        );
    }
}
