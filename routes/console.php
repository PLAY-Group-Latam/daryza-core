<?php

use App\Jobs\Orders\DispatchExpirePendingTransferOrdersJob;
use App\Http\Api\v1\Services\Orders\OrderService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('orders:expire-pending-transfers {--days=5} {--chunk=100} {--sync}', function (OrderService $orderService) {
    $days = max(1, (int) $this->option('days'));
    $chunk = max(1, (int) $this->option('chunk'));

    if ((bool) $this->option('sync')) {
        $result = $orderService->expirePendingBankTransferOrders($days);

        $this->info("Órdenes expiradas: {$result['expired_count']}");
        $this->line("Cutoff aplicado: {$result['cutoff']}");

        if (!empty($result['expired_order_ids'])) {
            $this->line('IDs: ' . implode(', ', $result['expired_order_ids']));
        }

        Log::info('orders:expire-pending-transfers ejecutado modo sync', $result + ['days' => $days, 'chunk' => $chunk]);
        return;
    }

    DispatchExpirePendingTransferOrdersJob::dispatch($days, $chunk);

    $this->info("Job encolado para expirar órdenes pendientes de transferencia (days={$days}, chunk={$chunk}).");
    Log::info('orders:expire-pending-transfers encolado', ['days' => $days, 'chunk' => $chunk, 'mode' => 'queued']);
})->purpose('Cancela automáticamente órdenes de transferencia pendientes y repone stock');

Schedule::command('orders:expire-pending-transfers --days=5')->hourly();
