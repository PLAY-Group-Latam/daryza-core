<?php

namespace App\Http\Web\Controllers\Products;

use App\Http\Api\v1\Controllers\Controller;
use App\Http\Web\Exports\ProductsExport;
use App\Http\Web\Imports\ProductsImport;
use App\Observers\Web\Product\ProductObserver;
use App\Http\Web\Requests\Products\StoreProductImportRequest;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ProductExcelController extends Controller
{
    public function showForm()
    {
        return Inertia::render('products/Import', [
            'importResult' => session('import_result'),
        ]);
    }

    public function import(StoreProductImportRequest $request)
    {
        $file = $request->file('file');
        $action = $request->string('action')->toString();
        $mode = $action === 'validate' ? 'validate' : 'import';
        $import = new ProductsImport($mode === 'validate');

        try {
            ProductObserver::$muteNotifications = true;
            Excel::import($import, $file);

            $summary = $import->getSummary();
            $failed = (int) ($summary['failed'] ?? 0);

            if ($mode === 'validate') {
                return back()->with('import_result', [
                    'mode' => 'validate',
                    'ok' => $failed === 0,
                    'summary' => $summary,
                    'message' => $failed === 0
                        ? 'Validación exitosa. Puedes proceder con la importación.'
                        : "Validación con incidencias. Errores detectados: {$failed}.",
                ]);
            }

            if ($failed > 0) {
                return back()->with('import_result', [
                    'mode' => 'import',
                    'ok' => false,
                    'summary' => $summary,
                    'message' => "Importación con incidencias. Procesadas: {$summary['processed']}/{$summary['total']}. Errores: {$failed}.",
                ]);
            }

            return back()->with('import_result', [
                'mode' => 'import',
                'ok' => true,
                'summary' => $summary,
                'message' => "Importación completada. Filas procesadas: {$summary['processed']}/{$summary['total']}.",
            ]);
        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            $failures = $e->failures();
            foreach ($failures as $failure) {
                Log::error("Fila {$failure->row()}: " . implode(', ', $failure->errors()));
            }
            return back()->with('import_result', [
                'mode' => $mode,
                'ok' => false,
                'summary' => [
                    'total' => 0,
                    'processed' => 0,
                    'failed' => count($failures),
                    'errors' => collect($failures)
                        ->map(fn($failure) => "Fila {$failure->row()}: " . implode(', ', $failure->errors()))
                        ->values()
                        ->all(),
                ],
                'message' => 'Algunas filas no pasaron la validación estructural del archivo.',
            ]);
        } catch (\Exception $e) {
            Log::error('Error al importar productos: ' . $e->getMessage());
            return back()->with('import_result', [
                'mode' => $mode,
                'ok' => false,
                'summary' => [
                    'total' => 0,
                    'processed' => 0,
                    'failed' => 1,
                    'errors' => ['Error al procesar el archivo. Revisa el formato y vuelve a intentar.'],
                ],
                'message' => 'No se pudo procesar el archivo.',
            ]);
        } finally {
            ProductObserver::$muteNotifications = false;
        }
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
}
