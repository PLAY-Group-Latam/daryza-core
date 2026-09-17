<?php

namespace App\Mail\StockLow;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LowStockAlert extends Mailable {

    use Queueable, SerializesModels;

    /**
     * @param array $data Debe contener: name, sku_or_code, stock, type
     */
    public function __construct(public array $data) {}

    public function envelope(): Envelope
    {
        // Definimos el asunto según el nivel de stock
        $status = ($this->data['stock'] <= 0) 
            ? '[DARYZA] Producto agotado' 
            : '[DARYZA] Producto con pocas existencias';
        
        return new Envelope(
            from: new Address(config('mail.from.address'), config('mail.from.name')),
            subject: $status,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.low-stock.low-stock-alert', 
            with: [
                'item' => $this->data,
            ]
        );
    }
}