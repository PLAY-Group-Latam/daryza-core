<?php

namespace App\Jobs\Orders;

use App\Http\Api\v1\Services\Orders\OrderService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class DispatchExpirePendingTransferOrdersJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $days = 5,
        public int $chunkSize = 100
    ) {}

    public function handle(OrderService $orderService): void
    {
        $days = max(1, (int) $this->days);
        $chunkSize = max(1, (int) $this->chunkSize);

        $orderIds = $orderService->findExpiredPendingBankTransferOrderIds($days);
        $chunks = array_chunk($orderIds, $chunkSize);

        foreach ($chunks as $chunk) {
            ExpirePendingTransferOrdersChunkJob::dispatch($chunk, $days);
        }

        Log::info('dispatch-expire-pending-transfer-orders', [
            'days' => $days,
            'candidate_count' => count($orderIds),
            'chunks' => count($chunks),
            'chunk_size' => $chunkSize,
        ]);
    }
}

