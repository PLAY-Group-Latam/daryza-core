<?php

namespace App\Mail\Order;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderPreparing extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(private Order $order) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(config('mail.from.address'), config('mail.from.name')),
            subject: 'Tu pedido #' . $this->order->purchase_number . ' está programado',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.order.3-preparing',
            with: [
                'customer' => $this->order->contact->full_name,
                'purchase_number' => $this->order->purchase_number,
            ],
        );
    }
}
