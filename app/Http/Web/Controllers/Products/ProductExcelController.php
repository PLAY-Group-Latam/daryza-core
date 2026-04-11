<?php

namespace App\Http\Web\Controllers\Products;

use App\Jobs\ProcessProductImportSessionJob;
use App\Http\Api\v1\Controllers\Controller;
use App\Http\Web\Exports\ProductsExport;
use App\Http\Web\Requests\Products\StoreProductImportRequest;
use App\Models\Products\ProductImportSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ProductExcelController extends Controller
{
    private const ACTIVE_STATUSES = ['queued', 'validating', 'importing'];
    private const FINISHED_STATUSES = ['completed', 'completed_with_errors', 'failed_validation', 'failed_system', 'cancelled'];
    private const RETRYABLE_STATUSES = ['failed_system', 'cancelled'];

    public function showForm(Request $request)
    {
        $sessionId = (string) $request->query('session', session('import_session_id', ''));
        $importSession = null;
        if ($sessionId !== '') {
            $importSession = ProductImportSession::query()
                ->whereKey($sessionId)
                ->where('user_id', $request->user()->id)
                ->first();
        }

        if (!$importSession) {
            $importSession = ProductImportSession::query()
                ->where('user_id', $request->user()->id)
                ->whereIn('status', self::ACTIVE_STATUSES)
                ->latest('created_at')
                ->first();
        }

        if (!$importSession) {
            $importSession = ProductImportSession::query()
                ->where('user_id', $request->user()->id)
                ->latest('created_at')
                ->first();
        }

        $importSessions = ProductImportSession::query()
            ->where('user_id', $request->user()->id)
            ->latest('created_at')
            ->limit(10)
            ->get()
            ->map(fn(ProductImportSession $session) => $this->serializeImportSession($session))
            ->values()
            ->all();

        return Inertia::render('products/Import', [
            'importResult' => session('import_result'),
            'importSession' => $importSession
                ? $this->serializeImportSession($importSession)
                : null,
            'importSessions' => $importSessions,
        ]);
    }

    public function import(StoreProductImportRequest $request)
    {
        return $this->runImportGuarded(function () use ($request) {
            if ($this->hasActiveImportSession()) {
                return $this->withImportResult(
                    'import',
                    false,
                    'Ya existe una importación de productos en proceso. Espera a que finalice antes de iniciar otra.'
                );
            }

            $file = $request->file('file');
            $action = $request->string('action')->toString();
            $mode = $action === 'validate' ? 'validate' : 'import';
            $storedPath = $file->store('imports/products');
            $totalRows = $this->resolveTotalRows(Storage::path($storedPath));

            $session = ProductImportSession::query()->create([
                'user_id' => $request->user()->id,
                'action' => $mode,
                'status' => 'queued',
                'file_path' => $storedPath,
                'original_filename' => $file->getClientOriginalName(),
                'total_rows' => $totalRows,
                'processed_rows' => 0,
                'failed_rows' => 0,
                'progress_percent' => 0,
                'resume_from_row' => 1,
                'summary' => null,
            ]);

            ProcessProductImportSessionJob::dispatch($session->id)->onQueue('default');

            return back()
                ->with('import_session_id', $session->id)
                ->with('import_result', $this->buildImportResult(
                    $mode,
                    true,
                    $mode === 'validate'
                        ? 'Validación en cola iniciada. Te avisaremos al finalizar.'
                        : 'Importación en cola iniciada. Puedes seguir trabajando mientras procesamos el archivo.'
                ));
        });
    }

    public function status(Request $request, ProductImportSession $session)
    {
        abort_unless($session->user_id === $request->user()->id, 403);

        $this->markSessionAsStalledIfNeeded($session);

        return response()->json([
            'session' => $this->serializeImportSession($session->fresh()),
        ]);
    }

    public function retry(Request $request, ProductImportSession $session)
    {
        abort_unless($session->user_id === $request->user()->id, 403);

        if ($session->action !== 'import') {
            return $this->withImportResult(
                $session->action,
                false,
                'Las validaciones con errores no se reintentan. Ajusta el Excel y vuelve a subir el archivo.'
            );
        }

        if (!in_array((string) $session->status, self::RETRYABLE_STATUSES, true)) {
            return $this->withImportResult(
                $session->action,
                false,
                'Solo puedes reintentar importaciones canceladas o con fallo técnico.'
            );
        }

        return $this->runImportGuarded(function () use ($session) {
            if ($this->hasActiveImportSession()) {
                return $this->withImportResult(
                    $session->action,
                    false,
                    'Hay una importación de productos en ejecución. Reintenta cuando finalice.'
                );
            }

            if (!Storage::exists($session->file_path)) {
                return $this->withImportResult(
                    $session->action,
                    false,
                    'No se encontró el archivo para reintentar la importación.'
                );
            }

            $newSession = ProductImportSession::query()->create([
                'user_id' => $session->user_id,
                'action' => $session->action,
                'status' => 'queued',
                'file_path' => $session->file_path,
                'original_filename' => $session->original_filename,
                'total_rows' => $session->total_rows,
                'processed_rows' => 0,
                'failed_rows' => 0,
                'progress_percent' => 0,
                // Reintento consistente: reprocesar desde inicio para evitar saltar filas con error.
                'resume_from_row' => 1,
                'retried_from_id' => $session->id,
            ]);

            ProcessProductImportSessionJob::dispatch($newSession->id)->onQueue('default');

            return back()
                ->with('import_session_id', $newSession->id)
                ->with('import_result', $this->buildImportResult(
                    $newSession->action,
                    true,
                    'Reintento en cola iniciado correctamente.'
                ));
        });
    }

    public function cancel(Request $request, ProductImportSession $session)
    {
        abort_unless($session->user_id === $request->user()->id, 403);

        if ($session->action !== 'import') {
            return $this->withImportResult(
                $session->action,
                false,
                'La validación no requiere cancelación manual. Espera a que termine o sube un nuevo archivo.',
            );
        }

        if (!in_array($session->status, self::ACTIVE_STATUSES, true)) {
            return $this->withImportResult(
                $session->action,
                false,
                'La importación ya finalizó y no se puede cancelar.'
            );
        }

        $session->update([
            'status' => 'cancelled',
            'error_message' => 'Importación cancelada por el usuario.',
            'finished_at' => now(),
            'progress_percent' => max(1, (int) $session->progress_percent),
        ]);

        return back()
            ->with('import_session_id', $session->id)
            ->with('import_result', $this->buildImportResult(
                $session->action,
                true,
                'Importación cancelada. No se procesarán más filas; lo ya procesado se mantiene.'
            ));
    }

    public function clearHistory(Request $request)
    {
        $userId = $request->user()->id;

        $hasActiveSession = ProductImportSession::query()
            ->where('user_id', $userId)
            ->whereIn('status', self::ACTIVE_STATUSES)
            ->exists();

        if ($hasActiveSession) {
            return $this->withImportResult(
                'import',
                false,
                'No se puede limpiar mientras hay una importación en proceso.'
            );
        }

        $sessions = ProductImportSession::query()
            ->where('user_id', $userId)
            ->get(['id', 'file_path', 'summary']);

        if ($sessions->isEmpty()) {
            return $this->withImportResult(
                'import',
                true,
                'No hay historial de importaciones para limpiar.'
            );
        }

        $importPaths = $sessions
            ->pluck('file_path')
            ->filter(fn($path) => is_string($path) && trim($path) !== '')
            ->unique()
            ->values();

        $errorPaths = $sessions
            ->map(function ($session) {
                $summary = is_array($session->summary) ? $session->summary : [];
                return [
                    $summary['errors_file_path_json'] ?? null,
                    $summary['errors_file_path_csv'] ?? null,
                ];
            })
            ->flatten()
            ->filter(fn($path) => is_string($path) && trim($path) !== '')
            ->unique()
            ->values();

        ProductImportSession::query()
            ->where('user_id', $userId)
            ->delete();

        $deletedFiles = 0;

        foreach ($importPaths as $path) {
            if (!Storage::exists($path)) {
                continue;
            }

            $isStillReferenced = ProductImportSession::query()
                ->where('file_path', $path)
                ->exists();

            if ($isStillReferenced) {
                continue;
            }

            if (Storage::delete($path)) {
                $deletedFiles++;
            }
        }

        foreach ($errorPaths as $path) {
            if (!Storage::exists($path)) {
                continue;
            }

            $isStillReferenced = ProductImportSession::query()
                ->where('summary->errors_file_path_json', $path)
                ->orWhere('summary->errors_file_path_csv', $path)
                ->exists();

            if ($isStillReferenced) {
                continue;
            }

            if (Storage::delete($path)) {
                $deletedFiles++;
            }
        }

        return back()
            ->with('import_session_id', null)
            ->with('import_result', $this->buildImportResult(
                'import',
                true,
                "Historial limpiado correctamente. Archivos eliminados: {$deletedFiles}."
            ));
    }

    public function errors(Request $request, ProductImportSession $session)
    {
        abort_unless($session->user_id === $request->user()->id, 403);

        $summary = is_array($session->summary) ? $session->summary : [];
        $page = max(1, (int) $request->query('page', 1));
        $perPage = max(1, min(200, (int) $request->query('per_page', 20)));
        $all = filter_var($request->query('all', false), FILTER_VALIDATE_BOOLEAN);

        $items = [];
        $total = (int) ($summary['errors_total_available'] ?? $session->failed_rows ?? 0);
        $jsonPath = $summary['errors_file_path_json'] ?? null;
        $csvPath = $summary['errors_file_path_csv'] ?? null;

        if (is_string($jsonPath) && trim($jsonPath) !== '' && Storage::exists($jsonPath)) {
            $raw = Storage::get($jsonPath);
            $decoded = json_decode($raw, true);
            $items = is_array($decoded) ? array_values($decoded) : [];
            $total = count($items);
        } elseif (is_string($csvPath) && trim($csvPath) !== '' && Storage::exists($csvPath)) {
            $items = $this->parseCsvErrors(Storage::get($csvPath));
            $total = count($items);
        } else {
            $details = $summary['error_details'] ?? [];
            $items = is_array($details) ? array_values($details) : [];
            // Si no existe dataset completo (JSON), paginamos solo lo disponible en summary.
            // Evita páginas "fantasma" que dejan la tabla vacía.
            $total = count($items);
        }

        $totalPages = max(1, (int) ceil($total / max(1, $perPage)));
        $page = min($page, $totalPages);
        $offset = ($page - 1) * $perPage;
        $slice = $all ? $items : array_slice($items, $offset, $perPage);

        return response()->json([
            'data' => $slice,
            'pagination' => [
                'page' => $all ? 1 : $page,
                'per_page' => $all ? max(1, count($items)) : $perPage,
                'total' => $total,
                'total_pages' => $all ? 1 : $totalPages,
            ],
        ]);
    }

    /**
     * @return array<int, array{row: int, field: string, message: string, value: string, context: array<string, mixed>}>
     */
    private function parseCsvErrors(string $csv): array
    {
        $lines = preg_split("/\r\n|\n|\r/", $csv) ?: [];
        $rows = [];
        $headerParsed = false;

        foreach ($lines as $line) {
            if (trim($line) === '') {
                continue;
            }

            $cells = str_getcsv($line);
            if (!$headerParsed) {
                $headerParsed = true;
                continue;
            }

            $rows[] = [
                'row' => (int) ($cells[0] ?? 0),
                'field' => (string) ($cells[1] ?? 'sin_columna'),
                'message' => (string) ($cells[2] ?? ''),
                'value' => (string) ($cells[3] ?? ''),
                'context' => [],
            ];
        }

        return $rows;
    }

    public function export()
    {
        // Genera algo como: productos_2026-02-16_16-55-20.xlsx
        $fileName = 'productos_daryza_' . now()->format('Y-m-d_H-i-s') . '.xlsx';

        return Excel::download(
            new ProductsExport(),
            $fileName
        );
    }

    private function resolveTotalRows(string $path): ?int
    {
        try {
            $reader = IOFactory::createReaderForFile($path);
            if (method_exists($reader, 'listWorksheetInfo')) {
                $worksheetInfo = $reader->listWorksheetInfo($path);
                $rows = (int) (($worksheetInfo[0]['totalRows'] ?? 0) - 1);
            } else {
                $spreadsheet = $reader->load($path);
                $rows = max(0, $spreadsheet->getActiveSheet()->getHighestDataRow() - 1);
                $spreadsheet->disconnectWorksheets();
                unset($spreadsheet);
            }

            return max(0, $rows);
        } catch (\Throwable $e) {
            Log::warning('No se pudo estimar total de filas del archivo de importación', [
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    private function serializeImportSession(ProductImportSession $session): array
    {
        $summary = is_array($session->summary) ? $session->summary : null;
        $status = (string) $session->status;

        $message = match ($status) {
            'queued' => 'En cola para procesamiento.',
            'validating' => 'Validando archivo...',
            'importing' => 'Importando productos...',
            'completed' => $session->action === 'validate'
                ? 'Validación finalizada sin errores.'
                : 'Importación finalizada correctamente.',
            'completed_with_errors' => 'Importación finalizada con observaciones.',
            'failed_validation' => 'Validación finalizada con errores.',
            'failed_system' => 'Ocurrió un error técnico durante el procesamiento.',
            'cancelled' => 'Importación cancelada por el usuario.',
            default => 'Estado de importación actualizado.',
        };

        $ok = in_array($status, ['completed', 'completed_with_errors'], true);

        return [
            'id' => $session->id,
            'action' => $session->action,
            'original_filename' => $session->original_filename,
            'status' => $status,
            'total_rows' => $session->total_rows,
            'processed_rows' => $session->processed_rows,
            'failed_rows' => $session->failed_rows,
            'progress_percent' => $session->progress_percent,
            'resume_from_row' => $session->resume_from_row,
            'summary' => $summary,
            'error_message' => $session->error_message,
            'message' => $message,
            'ok' => $ok,
            'is_finished' => in_array($status, self::FINISHED_STATUSES, true),
            'status_url' => route('products.items.import.status', ['session' => $session->id]),
            'retry_url' => route('products.items.import.retry', ['session' => $session->id]),
            'cancel_url' => route('products.items.import.cancel', ['session' => $session->id]),
            'errors_url' => route('products.items.import.errors', ['session' => $session->id]),
            'updated_at' => optional($session->updated_at)?->toISOString(),
        ];
    }

    private function markSessionAsStalledIfNeeded(ProductImportSession $session): void
    {
        if (!in_array($session->status, self::ACTIVE_STATUSES, true)) {
            return;
        }

        $updatedAt = $session->updated_at;
        if (!$updatedAt) {
            return;
        }

        // Si pasaron más de 15 minutos sin movimiento en sesión activa,
        // la marcamos como fallo técnico para habilitar reintento.
        if ($updatedAt->lt(now()->subMinutes(15))) {
            $session->update([
                'status' => 'failed_system',
                'error_message' => 'La sesión quedó detenida. Verifica el worker de cola y reintenta.',
                'finished_at' => now(),
                'progress_percent' => max(1, (int) $session->progress_percent),
            ]);
        }
    }

    private function hasActiveImportSession(): bool
    {
        return ProductImportSession::query()
            ->whereIn('status', self::ACTIVE_STATUSES)
            ->exists();
    }

    private function runImportGuarded(callable $callback)
    {
        $lock = Cache::lock('products-import-session-guard', 10);

        if (!$lock->get()) {
            return $this->withImportResult(
                'import',
                false,
                'Se está iniciando otra importación. Intenta nuevamente en unos segundos.'
            );
        }

        try {
            return $callback();
        } finally {
            $lock->release();
        }
    }

    private function withImportResult(string $mode, bool $ok, string $message)
    {
        return back()->with('import_result', $this->buildImportResult($mode, $ok, $message));
    }

    /**
     * @return array{mode: string, ok: bool, message: string}
     */
    private function buildImportResult(string $mode, bool $ok, string $message): array
    {
        return [
            'mode' => $mode,
            'ok' => $ok,
            'message' => $message,
        ];
    }
}
