<?php

namespace App\Mail\Order;

use App\Models\Orders\Order;
use App\Models\Settings\PaymentMethod;
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

    public function __construct(private Order $order) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(config('mail.from.address'), config('mail.from.name')),
            subject: 'Tu pedido #' . $this->order->code . ' ha sido recibido',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.order.1-awaiting-payment',
            with: [
                'customer' => trim($this->order->customer_first_name . ' ' . $this->order->customer_last_name),
                'purchase_number' => $this->order->code,
                'accounts' => $this->mapActiveBankAccounts(),
                'items' => $this->mapItems(),
                'total' => 'S/ ' . number_format((float) $this->order->total, 2, '.', ''),
            ]
        );
    }

    private function mapItems(): Collection
    {
        return $this->order->items->map(function ($item) {
            return [
                'title' => $item->product_name,
                'quantity' => (int) $item->quantity,
                'price' => 'S/ ' . number_format((float) $item->unit_price, 2, '.', ''),
                'total' => 'S/ ' . number_format((float) $item->line_total, 2, '.', ''),
            ];
        });
    }

    private function mapActiveBankAccounts(): Collection
    {
        if ($this->order->payment_method_type !== 'bank_transfer') {
            return collect();
        }

        return PaymentMethod::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['name', 'account_number', 'extra_info'])
            ->map(fn(PaymentMethod $method) => [
                'bank_name' => (string) $method->name,
                'account_number' => (string) ($method->account_number ?? ''),
                'interbank_account_number' => (string) ($method->extra_info ?? ''),
            ])
            ->values();
    }
}
