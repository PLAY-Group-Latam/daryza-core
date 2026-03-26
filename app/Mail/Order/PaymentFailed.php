<?php

namespace App\Mail\Order;

use App\Models\Orders\Order;
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
            subject: 'Pago fallido - Pedido#' . $this->order->code,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.order.2-payment-failed',
            with: [
                'customer' => trim($this->order->customer_first_name . ' ' . $this->order->customer_last_name),
                'purchase_number' => $this->order->code,
                'purchase_date' => $this->order->created_at?->format('d/m/Y h:i a') ?? '',
                'total' => 'S/ ' . number_format((float) $this->order->total, 2, '.', ''),
                'items' => $this->order->items->map(function ($item) {
                    return [
                        'title' => $item->product_name,
                        'quantity' => $item->quantity,
                        'price' => 'S/ ' . number_format((float) $item->unit_price, 2, '.', ''),
                        'total' => 'S/ ' . number_format((float) $item->line_total, 2, '.', ''),
                    ];
                }),
            ]
        );
    }
}
