<?php

namespace App\Jobs\Orders;

use App\Http\Api\v1\Services\Orders\OrderService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class ExpirePendingTransferOrdersChunkJob implements ShouldQueue
{
    use Queueable;

    /**
     * @param array<int, string> $orderIds
     */
    public function __construct(
        public array $orderIds,
        public int $days = 5
    ) {}

    public function handle(OrderService $orderService): void
    {
        $expiredCount = 0;

        foreach ($this->orderIds as $orderId) {
            if ($orderService->expirePendingBankTransferOrderById((string) $orderId, $this->days)) {
                $expiredCount++;
            }
        }

        Log::info('expire-pending-transfer-orders-chunk-processed', [
            'received_ids' => count($this->orderIds),
            'expired_count' => $expiredCount,
            'days' => $this->days,
        ]);
    }
}

