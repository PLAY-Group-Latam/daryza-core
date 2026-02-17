<?php

namespace App\Http\Web\Controllers\Products;

use App\Http\Api\v1\Controllers\Controller;
use App\Http\Web\Exports\ProductsExport;
use App\Http\Web\Imports\ProductsImport;

use App\Http\Web\Requests\Products\StoreProductImportRequest;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ProductExcelController extends Controller
{
    public function showForm()
    {

        return Inertia::render('products/Import');
    }

    public function import(StoreProductImportRequest $request)
    {
        $file = $request->file('file');
        try {
            Excel::import(new ProductsImport(), $file);


            return redirect()->route('products.items.index')->with('success', 'Productos importados correctamente.');
        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            $failures = $e->failures();
            foreach ($failures as $failure) {
                Log::error("Fila {$failure->row()}: " . implode(', ', $failure->errors()));
            }
            return back()->withErrors(['file' => 'Algunas filas no pasaron la validación.']);
        } catch (\Exception $e) {
            Log::error('Error al importar productos: ' . $e->getMessage());
            return back()->withErrors(['file' => 'Error al procesar el archivo.']);
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
