<?php

namespace App\Mail\Order;

use App\Models\Orders\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewOrderAdminNotification extends Mailable {

    use Queueable, SerializesModels;

public function __construct(public Order $order) 
    {
        // Cargamos items, método de pago y el cupón a través de la redención
        $this->order->loadMissing(['items', 'paymentMethod', 'couponRedemptions.coupon']);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(config('mail.from.address'), config('mail.from.name')),
            subject: "¡Tienes un nuevo pedido! {$this->order->code}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.order.new-order-admin',
            with: [
                'order' => $this->order,
            ]
        );
    }
}