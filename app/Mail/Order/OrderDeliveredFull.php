<?php

namespace App\Mail\Order;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderDeliveredFull extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(private Order $order) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(config('mail.from.address'), config('mail.from.name')),
            subject: 'Tu pedido #' . $this->order->purchase_number . ' ha sido entregado con éxito',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.order.5-delivered-full',
            with: [
                'customer' => $this->order->contact->full_name,
                'purchase_number' => $this->order->purchase_number,
                'items' => $this->order->items->map(function ($item) {
                    return [
                        'title' => $item->title,
                        'quantity' => $item->quantity,
                        'price' => 'S/ ' . $item->discount,
                        'total' => 'S/ ' . $item->total,
                    ];
                }),
                'total' => 'S/ ' . $this->order->total,
            ],
        );
    }
}
