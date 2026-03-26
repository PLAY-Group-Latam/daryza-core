<?php

namespace App\Mail\Order;

use App\Models\Orders\Order;
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
            subject: 'Tu pedido #' . $this->order->code . ' ha sido entregado con éxito',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.order.5-delivered-full',
            with: [
                'customer' => trim($this->order->customer_first_name . ' ' . $this->order->customer_last_name),
                'purchase_number' => $this->order->code,
                'items' => $this->order->items->map(function ($item) {
                    return [
                        'title' => $item->product_name,
                        'quantity' => $item->quantity,
                        'price' => 'S/ ' . number_format((float) $item->unit_price, 2, '.', ''),
                        'total' => 'S/ ' . number_format((float) $item->line_total, 2, '.', ''),
                    ];
                }),
                'total' => 'S/ ' . number_format((float) $this->order->total, 2, '.', ''),
            ],
        );
    }
}
