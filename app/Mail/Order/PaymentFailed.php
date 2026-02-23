<?php

namespace App\Mail\Order;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PaymentFailed extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(private Order $order) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(config('mail.from.address'), config('mail.from.name')),
            subject: 'Pago fallido - Pedido#' . $this->order->purchase_number,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.order.2-payment-failed',
            with: [
                'customer' => $this->order->contact->full_name,
                'purchase_number' => $this->order->purchase_number,
                'purchase_date' => $this->order->created_at?->format('d/m/Y h:i a') ?? '',
                'total' => $this->order->total,
                'items' => $this->order->items->map(function ($item) {
                    return [
                        'title' => $item->title,
                        'quantity' => $item->quantity,
                        'price' => $item->discount,
                        'total' => $item->total,
                    ];
                }),
            ]
        );
    }
}
