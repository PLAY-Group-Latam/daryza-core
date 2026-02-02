<?php

namespace App\Http\Web\Controllers\Products;

use App\Http\Api\v1\Controllers\Controller;
use App\Http\Web\Jobs\ImportProductsJob;
use Illuminate\Http\Request;
use App\Http\Web\Requests\Products\StoreProductImportRequest;
use App\Models\Import;
use Inertia\Inertia;

class ProductImportController extends Controller
{
    public function showForm()
    {
        return Inertia::render('products/Import'); // Página React con el formulario
    }

    public function import(StoreProductImportRequest $request)
    {
        $file = $request->file('file');
        $path = $file->store('imports');

        // Crear registro en la base de datos
        $import = Import::create([
            'file_name' => $file->getClientOriginalName(),
            'path' => $path,
            'status' => 'pending',
        ]);

        // Pasar el ULID al job
        ImportProductsJob::dispatch($import->id);

        return redirect()->back()->with('success', 'Importación en proceso. Puede tardar varios minutos.');
    }

  public function status(string $id)
{
    $import = Import::findOrFail($id);

    return Inertia::render('products/Import', [
        'import' => $import,
    ]);
}
}
