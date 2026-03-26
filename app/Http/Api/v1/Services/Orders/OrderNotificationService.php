<?php

namespace App\Http\Api\v1\Services\Orders;

use App\Jobs\SendEmailJob;
use App\Mail\Order\AwaitingPayment;
use App\Mail\Order\OrderCancelled;
use App\Mail\Order\OrderDeliveredFailed;
use App\Mail\Order\OrderDeliveredFull;
use App\Mail\Order\OrderPreparing;
use App\Mail\Order\OrderShipping;
use App\Mail\Order\PaymentAproved;
use App\Mail\Order\PaymentFailed;
use App\Models\Orders\Order;
use Illuminate\Mail\Mailable;

class OrderNotificationService
{
    public function sendOrderCreated(Order $order): void
    {
        if ($order->state === 'pending_payment') {
            $this->dispatchToCustomer($order, new AwaitingPayment($order));
            return;
        }

        $this->sendForState($order, $order->state);
    }

    public function sendStateChanged(Order $order, ?string $fromState, string $toState): void
    {
        if ($fromState === $toState) {
            return;
        }

        $this->sendForState($order, $toState);
    }

    public function sendForState(Order $order, string $state): void
    {
        $mailable = match ($state) {
            'pending_payment' => new AwaitingPayment($order),
            'payment_received' => new PaymentAproved($order),
            'preparing' => new OrderPreparing($order),
            'in_delivery' => new OrderShipping($order),
            'delivered' => new OrderDeliveredFull($order),
            'delivery_failed' => new OrderDeliveredFailed($order),
            'cancelled' => new OrderCancelled($order),
            'payment_failed' => new PaymentFailed($order),
            default => null,
        };

        if ($mailable) {
            $this->dispatchToCustomer($order, $mailable);
        }
    }

    private function dispatchToCustomer(Order $order, Mailable $mailable): void
    {
        $to = strtolower(trim((string) $order->customer_email));

        if ($to === '') {
            return;
        }

        SendEmailJob::dispatch($mailable, $to);
    }
}

