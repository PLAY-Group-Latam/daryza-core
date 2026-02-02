<?php

namespace App\Http\Web\Jobs;

use App\Http\Web\Imports\ProductsImport;
use App\Http\Web\Services\Products\ProductService;
use App\Models\Import;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Maatwebsite\Excel\Facades\Excel;

class ImportProductsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected string $filePath;
    protected string $importId;

    public function __construct(string $importId)
    {
        $this->importId = $importId;
    }

    public function handle(ProductService $productService)
    {
        $import = Import::findOrFail($this->importId);

        // Marcar como processing
        $import->update(['status' => 'processing']);

        try {
            Excel::import(
                new ProductsImport($productService),
                storage_path('app/' . $import->path)
            );

            // Marcar como done
            $import->update(['status' => 'done']);
        } catch (\Throwable $e) {
            // Guardar error y marcar como failed
            $import->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);
        }
    }
}