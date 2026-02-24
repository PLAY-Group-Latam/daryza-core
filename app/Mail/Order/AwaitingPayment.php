<?php

namespace App\Mail\Order;

use App\Models\CompanyAccount;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

class AwaitingPayment extends Mailable
{
    use Queueable, SerializesModels;

    private Collection $accounts;

    public function __construct(private Order $order)
    {
        $this->accounts = CompanyAccount::all();
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(config('mail.from.address'), config('mail.from.name')),
            subject: 'Tu pedido #' . $this->order->purchase_number . ' ha sido recibido',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.order.1-awaiting-payment',
            with: [
                'customer' => $this->order->contact->full_name,
                'purchase_number' => $this->order->purchase_number,
                'accounts' => $this->accounts,
                'items' => $this->order->items->map(function ($item) {
                    return [
                        'title' => $item->title,
                        'quantity' => $item->quantity,
                        'price' => 'S/ ' . $item->discount,
                        'total' => 'S/ ' . $item->total,
                    ];
                }),
                'total' => 'S/ ' . $this->order->total,
            ]
        );
    }
}
