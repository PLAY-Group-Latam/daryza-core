<?php

namespace App\Http\Web\Controllers\Products;

use App\Http\Web\Controllers\Controller;
use App\Http\Web\Requests\Products\StoreProductPackRequest;
use App\Http\Web\Requests\Products\UpdateProductPackRequest;
use App\Http\Web\Services\Products\ProductPackService;
use App\Http\Web\Services\Products\ProductSearchService;
use App\Models\Products\ProductPack;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ProductPackController extends Controller
{
    public function __construct(
        protected ProductSearchService $searchService,
        protected ProductPackService $packService,
    ) {}
    /**
     * Listado de packs
     */
    public function index()
    {
        // Capturamos la cantidad de filas por página, por defecto 10
        $perPage = request()->input('per_page', 10);

        // Cargamos los packs con sus relaciones para evitar el problema N+1
        // Cargamos items, y dentro de items el producto y la variante
        $packs = ProductPack::with(['items.product', 'items.variant'])
            ->latest()
            ->paginate($perPage)
            ->withQueryString(); // Mantiene los filtros de la URL al cambiar de página

        return Inertia::render('products/packs/Index', [
            'paginatedPacks' => $packs,
        ]);
    }

    /**
     * Mostrar el formulario de creación
     * Pasamos los productos para que React los muestre en la tabla de selección
     */
    public function create(Request $request): Response
    {
        $search = trim($request->input('q', ''));

        // 1. Manejo de la búsqueda (idéntico al create para añadir nuevos items)
        $searchResults = $this->searchService->searchVariantsBySku($search);

        return Inertia::render('products/packs/Create', [
            'searchResults' => $searchResults,
            'filters' => ['q' => $search]
        ]);
    }

    /**
     * Guardar el pack
     */
    public function store(StoreProductPackRequest $request)
    {
        try {
            $this->packService->create($request->validated());
        } catch (ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        }

        // 3. Redirección al listado con mensaje de éxito
        return redirect()->route('products.packs.index')
            ->with('success', 'Pack creado exitosamente con sus productos.');
    }

    /**
     * Formulario de edición
     */
    /**
     * Formulario de edición de Pack.
     */
    public function edit(Request $request, ProductPack $pack): Response
    {
        $search = trim($request->input('q', ''));

        // 1. Manejo de la búsqueda (idéntico al create para añadir nuevos items)
        $searchResults = $this->searchService->searchVariantsBySku($search);

        $pack->load([
            'items.variant.product',
            'items.variant.attributes',
            'items.variant.mainImage',
            'media' => fn($q) => $q->orderBy('order', 'asc'),
        ]);

        return Inertia::render('products/packs/Edit', [
            'pack' => [
                // Pasamos todos los campos del modelo (incluye stock, descripciones, etc.)
                ...$pack->toArray(),
                // Formateo específico para JS Date o datetime-local
                'promo_start_at' => $pack->promo_start_at?->format('Y-m-d\TH:i'),
                'promo_end_at'   => $pack->promo_end_at?->format('Y-m-d\TH:i'),
                // Formateamos items para que la tabla en React los maneje fácil
                'items' => $pack->items->map(fn($item) => [
                    'variant_id'   => $item->variant_id,
                    'product_id'   => $item->product_id,
                    'sku'          => $item->variant->sku,
                    'quantity'     => $item->quantity,
                    'product_name' => $item->variant->product->name,
                    'variant_name'        => "(" . ($item->variant->attributes->pluck('value')->implode('-') ?: 'Única') . ")",
                    'image'        => $item->variant->mainImage?->file_path,
                ]),
                'media' => $pack->media->map(fn($media) => [
                    'id' => $media->id,
                    'file_path' => $media->file_path,
                    'type' => $media->type,
                    'order' => $media->order,
                ])->values(),
            ],
            'searchResults' => $searchResults,
            'filters' => ['q' => $search]
        ]);
    }

    /**
     * Actualizar
     */
    public function update(UpdateProductPackRequest $request, ProductPack $pack) // El parámetro debe coincidir con la ruta o usar el objeto
    {
        try {
            $this->packService->update($pack, $request->validated());
        } catch (ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        }

        return redirect()->route('products.packs.index')
            ->with('success', "El pack '{$pack->name}' ha sido actualizado.");
    }


    /**
     * Eliminar el pack y sus items asociados.
     */
    public function destroy(ProductPack $pack)
    {
        try {
            $this->packService->delete($pack);

            return redirect()->route('products.packs.index')
                ->with('success', "El pack '{$pack->name}' ha sido eliminado correctamente.");
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'No se pudo eliminar el pack porque tiene datos relacionados.');
        }
    }
}
