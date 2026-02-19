<?php

namespace App\Http\Web\Controllers\Products;

use App\Http\Web\Controllers\Controller;
use App\Http\Web\Services\Products\ProductSearchService;
use App\Models\Products\ProductPack;
use App\Models\Products\Product; // Para cargar la lista de productos en el form
use App\Models\Products\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductPackController extends Controller
{

    protected $searchService;

    // Inyectamos el servicio en el constructor
    public function __construct(ProductSearchService $searchService)
    {
        $this->searchService = $searchService;
    }
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
    public function store(Request $request)
    {
        // 1. Validamos todos los campos, incluyendo el array de items
        $validated = $request->validate([
            'name'              => 'required|string|max:255',
            'slug'              => 'required|string|max:255|unique:product_packs,slug',
            'brief_description' => 'nullable|string',
            'description'       => 'nullable|string',
            'stock'             => 'required|integer|min:0',
            'price'             => 'required|numeric|min:0',
            'promo_price'       => 'nullable|numeric|lt:price',
            'is_on_promotion'   => 'boolean',
            'show_on_home'      => 'boolean',
            'is_active'         => 'boolean',
            'promo_start_at'    => 'nullable|date',
            'promo_end_at'      => 'nullable|date|after_or_equal:promo_start_at',

            // Validación de los productos (items) que vienen del formulario
            'items'              => 'required|array|min:1',
            'items.*.variant_id' => 'required|exists:product_variants,id',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1',
        ]);

        // 2. Usamos una transacción para asegurar que se cree el pack Y sus productos
        DB::transaction(function () use ($validated) {
            // Creamos el Pack (filtramos 'items' para que no de error al insertar en la tabla de packs)
            $pack = ProductPack::create(collect($validated)->except('items')->toArray());

            // Creamos los productos asociados (items)
            foreach ($validated['items'] as $item) {
                $pack->items()->create([
                    'product_id' => $item['product_id'],
                    'variant_id' => $item['variant_id'],
                    'quantity'   => $item['quantity'],
                    // 'price'     => $item['price'] ?? 0, // Por si guardas el precio histórico
                ]);
            }
        });

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

        $pack->load(['items.variant.product', 'items.variant.attributes']);

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
                ]),
            ],
            'searchResults' => $searchResults,
            'filters' => ['q' => $search]
        ]);
    }

    /**
     * Actualizar
     */
    public function update(Request $request, ProductPack $pack) // El parámetro debe coincidir con la ruta o usar el objeto
    {
        // 1. Validación exhaustiva coincidente con el Formulario
        $validated = $request->validate([
            'name'              => 'required|string|max:255',
            'slug'              => 'required|string|max:255|unique:product_packs,slug,' . $pack->id,
            'brief_description' => 'nullable|string',
            'description'       => 'nullable|string',
            'stock'             => 'required|integer|min:0',
            'price'             => 'required|numeric|min:0',
            'promo_price'       => 'nullable|numeric|lt:price',
            'is_on_promotion'   => 'boolean',
            'show_on_home'      => 'boolean',
            'is_active'         => 'boolean',
            'promo_start_at'    => 'nullable|date',
            'promo_end_at'      => 'nullable|date|after_or_equal:promo_start_at',

            // Validación de los items (productos del pack)
            'items'             => 'required|array|min:1',
            'items.*.variant_id' => 'required|exists:product_variants,id',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1',
        ]);

        // 2. Transacción para asegurar que no queden items huérfanos si falla algo
        DB::transaction(function () use ($validated, $pack) {

            // Actualizamos los datos generales del pack
            // collect($validated)->except('items')->toArray() filtra para no intentar guardar 'items' en la tabla packs
            $pack->update(collect($validated)->except('items')->toArray());

            // Sincronizamos los productos (items)
            // La forma más limpia en Packs es borrar y volver a crear
            $pack->items()->delete();

            foreach ($validated['items'] as $item) {
                $pack->items()->create([
                    'product_id' => $item['product_id'],
                    'variant_id' => $item['variant_id'],
                    'quantity'   => $item['quantity'],
                    // 'price' => $item['price'], // Opcional si guardas el precio histórico
                ]);
            }
        });

        return redirect()->route('products.packs.index')
            ->with('success', "El pack '{$pack->name}' ha sido actualizado.");
    }


    /**
     * Eliminar el pack y sus items asociados.
     */
    public function destroy(ProductPack $pack)
    {
        try {
            DB::transaction(function () use ($pack) {
                // 1. Eliminamos primero los items relacionados
                // (Si no tienes cascade delete a nivel BD)
                $pack->items()->delete();

                // 2. Eliminamos el pack
                $pack->delete();
            });

            return redirect()->route('products.packs.index')
                ->with('success', "El pack '{$pack->name}' ha sido eliminado correctamente.");
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'No se pudo eliminar el pack porque tiene datos relacionados.');
        }
    }
}
