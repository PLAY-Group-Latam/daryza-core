<?php

namespace App\Mail\Order;

use App\Models\Orders\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderDeliveredFailed extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(private Order $order) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(config('mail.from.address'), config('mail.from.name')),
            subject: 'Entrega fallida - Pedido #' . $this->order->code,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.order.5-delivered-failed',
            with: [
                'customer' => trim($this->order->customer_first_name . ' ' . $this->order->customer_last_name),
                'purchase_number' => $this->order->code,
            ],
        );
    }
}
