<?php

namespace App\Jobs;

use App\Http\Web\Imports\ProductsImport;
use App\Models\Products\ProductImportSession;
use App\Observers\Web\Product\ProductObserver;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Validators\ValidationException;
use Throwable;

class ProcessProductImportSessionJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 3600;

    public function __construct(
        public string $sessionId
    ) {}

    public function handle(): void
    {
        $session = ProductImportSession::query()->find($this->sessionId);
        if (!$session) {
            return;
        }

        if (!Storage::exists($session->file_path)) {
            $session->update([
                'status' => 'failed_system',
                'error_message' => 'No se encontró el archivo de importación.',
                'finished_at' => now(),
            ]);
            return;
        }

        $dryRun = $session->action === 'validate';
        $resumeFromRow = max(1, (int) ($session->resume_from_row ?? 1));
        $totalRows = (int) ($session->total_rows ?? 0);

        if ($totalRows > 0 && $resumeFromRow > $totalRows) {
            $session->update([
                'status' => 'completed',
                'progress_percent' => 100,
                'finished_at' => now(),
                'summary' => $session->summary ?? [
                    'total' => $totalRows,
                    'processed' => $totalRows,
                    'failed' => (int) ($session->failed_rows ?? 0),
                ],
            ]);
            return;
        }

        $session->update([
            'status' => $dryRun ? 'validating' : 'importing',
            'started_at' => $session->started_at ?? now(),
            'error_message' => null,
            'progress_percent' => max(1, (int) $session->progress_percent),
        ]);

        $import = new ProductsImport($dryRun, $session->id, $resumeFromRow);
        $filePath = Storage::path($session->file_path);

        try {
            ProductObserver::$muteNotifications = true;
            Excel::import($import, $filePath);
            $summary = $import->getSummary();
            $failed = (int) ($summary['failed'] ?? 0);
            $total = (int) ($summary['total'] ?? 0);
            $processedGlobal = (int) ($summary['processed_global'] ?? $total);
            $status = $failed > 0
                ? ($dryRun ? 'failed_validation' : 'completed_with_errors')
                : 'completed';

            $session->update([
                'status' => $status,
                'processed_rows' => max((int) ($session->processed_rows ?? 0), $processedGlobal),
                'failed_rows' => $failed,
                'total_rows' => $session->total_rows ?: max($total, $processedGlobal),
                'progress_percent' => 100,
                'summary' => $this->preparePersistableSummary($session, $summary),
                'finished_at' => now(),
                'resume_from_row' => null,
            ]);
        } catch (ValidationException $e) {
            $failures = $e->failures();
            $summary = [
                'total' => 0,
                'processed' => 0,
                'failed' => count($failures),
                'errors' => collect($failures)
                    ->map(fn($failure) => "Fila {$failure->row()}: " . implode(', ', $failure->errors()))
                    ->values()
                    ->all(),
                'error_details' => collect($failures)
                    ->map(function ($failure) {
                        $attribute = (string) $failure->attribute();
                        $values = method_exists($failure, 'values') ? $failure->values() : [];
                        $value = is_array($values) && $attribute !== ''
                            ? (string) ($values[$attribute] ?? '')
                            : '';

                        return [
                            'row' => $failure->row(),
                            'message' => implode(', ', $failure->errors()),
                            'field' => $attribute !== '' ? $attribute : 'sin_columna',
                            'value' => $value,
                            'context' => [],
                        ];
                    })
                    ->values()
                    ->all(),
                'error_columns' => collect($failures)
                    ->groupBy(fn($failure) => (string) $failure->attribute())
                    ->map(fn($group, $attribute) => [
                        'column' => (string) $attribute,
                        'count' => $group->count(),
                    ])
                    ->sortByDesc('count')
                    ->values()
                    ->all(),
            ];

            $session->update([
                'status' => 'failed_validation',
                'failed_rows' => count($failures),
                'progress_percent' => 100,
                'summary' => $this->preparePersistableSummary($session, $summary),
                'error_message' => 'Algunas filas no pasaron la validación estructural del archivo.',
                'finished_at' => now(),
                'resume_from_row' => null,
            ]);
        } catch (\Throwable $e) {
            if ($e->getMessage() === ProductsImport::cancellationExceptionMarker()) {
                $session->refresh();
                if ((string) $session->status !== 'cancelled') {
                    $session->update([
                        'status' => 'cancelled',
                        'error_message' => 'Importación cancelada por el usuario.',
                        'finished_at' => now(),
                        'progress_percent' => max(1, (int) $session->progress_percent),
                    ]);
                }
                return;
            }

            Log::error('Error al procesar sesión de importación de productos', [
                'session_id' => $session->id,
                'error' => $e->getMessage(),
            ]);

            $session->update([
                'status' => 'failed_system',
                'progress_percent' => max(1, (int) $session->progress_percent),
                'error_message' => 'Ocurrió un error técnico al procesar el archivo.',
                'finished_at' => now(),
                'resume_from_row' => max(1, (int) ($session->processed_rows ?? 0) + 1),
            ]);
        } finally {
            ProductObserver::$muteNotifications = false;
        }
    }

    public function failed(Throwable $e): void
    {
        $session = ProductImportSession::query()->find($this->sessionId);
        if (!$session) {
            return;
        }

        $session->update([
            'status' => 'failed_system',
            'progress_percent' => max(1, (int) $session->progress_percent),
            'error_message' => 'La importación falló en cola. Reintenta el proceso.',
            'finished_at' => now(),
            'resume_from_row' => max(1, (int) ($session->processed_rows ?? 0) + 1),
        ]);

        Log::error('Sesión de importación marcada como fallida desde callback failed()', [
            'session_id' => $this->sessionId,
            'error' => $e->getMessage(),
        ]);
    }

    /**
     * @param array<string, mixed> $summary
     * @return array<string, mixed>
     */
    private function preparePersistableSummary(ProductImportSession $session, array $summary): array
    {
        $details = collect($summary['error_details'] ?? [])
            ->filter(fn($item) => is_array($item))
            ->values();

        $messages = collect($summary['errors'] ?? [])
            ->map(fn($item) => (string) $item)
            ->values();

        if ($details->isNotEmpty()) {
            $timestamp = now()->format('Ymd_His');
            $basePath = "imports/products/errors/{$session->id}_{$timestamp}";

            $jsonPath = "{$basePath}.json";
            $savedJson = Storage::put(
                $jsonPath,
                json_encode($details->all(), JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT)
            );

            $csvPath = "{$basePath}.csv";
            $savedCsv = Storage::put($csvPath, $this->buildCsvErrors($details->all()));

            if ($savedJson) {
                $summary['errors_file_path_json'] = $jsonPath;
            }

            if ($savedCsv) {
                $summary['errors_file_path_csv'] = $csvPath;
            }

            $summary['errors_total_available'] = $details->count();
        }

        // Guardamos todo el detalle para asegurar que la UI siempre pueda paginar
        // todos los errores, incluso si no existe archivo auxiliar.
        $summary['error_details'] = $details->all();
        $summary['errors'] = $messages->all();

        return $summary;
    }

    /**
     * @param array<int, array<string, mixed>> $items
     */
    private function buildCsvErrors(array $items): string
    {
        $stream = fopen('php://temp', 'r+');
        if ($stream === false) {
            return "fila,campo,mensaje,valor\n";
        }

        fputcsv($stream, ['fila', 'campo', 'mensaje', 'valor']);

        foreach ($items as $item) {
            fputcsv($stream, [
                (string) ($item['row'] ?? ''),
                (string) ($item['field'] ?? ''),
                (string) ($item['message'] ?? ''),
                (string) ($item['value'] ?? ''),
            ]);
        }

        rewind($stream);
        $csv = stream_get_contents($stream) ?: '';
        fclose($stream);

        return $csv;
    }
}
