<?php

use App\Jobs\Orders\DispatchExpirePendingTransferOrdersJob;
use App\Http\Api\v1\Services\Orders\OrderService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schedule;
use Illuminate\Support\Facades\Storage;
use App\Models\Products\ProductImportSession;

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

Artisan::command('imports:cleanup-files {--days=5} {--chunk=200}', function () {
    $days = max(1, (int) $this->option('days'));
    $chunk = max(50, (int) $this->option('chunk'));
    $cutoff = now()->subDays($days);

    $finishedStatuses = ['completed', 'completed_with_errors', 'failed_validation', 'failed_system', 'cancelled'];
    $deletedSessions = 0;
    $deletedErrorFiles = 0;
    $deletedImportFiles = 0;

    $importPaths = [];
    $errorPaths = [];

    ProductImportSession::query()
        ->whereIn('status', $finishedStatuses)
        ->where(function ($query) use ($cutoff) {
            $query->where('finished_at', '<', $cutoff)
                ->orWhere(function ($nested) use ($cutoff) {
                    $nested->whereNull('finished_at')
                        ->where('created_at', '<', $cutoff);
                });
        })
        ->orderBy('id')
        ->chunkById($chunk, function ($sessions) use (&$importPaths, &$errorPaths, &$deletedSessions) {
            $ids = [];
            foreach ($sessions as $session) {
                $ids[] = $session->id;

                if (is_string($session->file_path) && trim($session->file_path) !== '') {
                    $importPaths[] = $session->file_path;
                }

                $summary = is_array($session->summary) ? $session->summary : [];
                $jsonPath = $summary['errors_file_path_json'] ?? null;
                $csvPath = $summary['errors_file_path_csv'] ?? null;

                if (is_string($jsonPath) && trim($jsonPath) !== '') {
                    $errorPaths[] = $jsonPath;
                }

                if (is_string($csvPath) && trim($csvPath) !== '') {
                    $errorPaths[] = $csvPath;
                }
            }

            if (!empty($ids)) {
                $deletedSessions += ProductImportSession::query()
                    ->whereIn('id', $ids)
                    ->delete();
            }
        });

    $importPaths = array_values(array_unique($importPaths));
    $errorPaths = array_values(array_unique($errorPaths));

    foreach ($importPaths as $path) {
        if (!Storage::exists($path)) {
            continue;
        }

        $isReferenced = ProductImportSession::query()
            ->where('file_path', $path)
            ->exists();

        if ($isReferenced) {
            continue;
        }

        if (Storage::delete($path)) {
            $deletedImportFiles++;
        }
    }

    foreach ($errorPaths as $path) {
        if (!Storage::exists($path)) {
            continue;
        }

        $isReferenced = ProductImportSession::query()
            ->where('summary->errors_file_path_json', $path)
            ->orWhere('summary->errors_file_path_csv', $path)
            ->exists();

        if ($isReferenced) {
            continue;
        }

        if (Storage::delete($path)) {
            $deletedErrorFiles++;
        }
    }

    $this->info("Cleanup completado. sessions={$deletedSessions}, errors={$deletedErrorFiles}, imports={$deletedImportFiles}, days={$days}");
    Log::info('imports:cleanup-files ejecutado', [
        'days' => $days,
        'chunk' => $chunk,
        'deleted_sessions' => $deletedSessions,
        'deleted_error_files' => $deletedErrorFiles,
        'deleted_import_files' => $deletedImportFiles,
    ]);
})->purpose('Limpia archivos temporales de importación y errores antiguos');

Schedule::command('imports:cleanup-files --days=5')->daily();
