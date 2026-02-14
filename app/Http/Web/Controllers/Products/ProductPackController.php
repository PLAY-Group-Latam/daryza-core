<?php

namespace App\Http\Web\Controllers\Products;

use App\Http\Web\Controllers\Controller;
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
        $results = collect();

        if (strlen($search) >= 3) {
            $searchTerm = "%{$search}%";

            $results = ProductVariant::query()
                // Añadimos campos de promoción al select
                ->select('id', 'product_id', 'sku', 'price', 'promo_price', 'is_on_promo')
                ->where('sku', 'ilike', $searchTerm)
                ->with([
                    'product:id,name',
                    'attributeValues:id,value'
                ])
                ->limit(15)
                ->get()
                ->map(fn($variant) => [
                    'id'           => $variant->id,
                    'sku'          => $variant->sku,
                    'price'        => $variant->price,
                    // Información de promoción
                    'is_on_promo'  => $variant->is_on_promo,
                    'product_name' => $variant->product?->name ?? 'Sin nombre',
                    'variant_name'         => $variant->attributeValues->pluck('value')->implode(' - ') ?: "Variante única",

                ]);
        }
        return Inertia::render('products/packs/Create', [
            'searchResults' => $results,
            'filters'       => ['q' => $search]
        ]);
    }

    /**
     * Guardar el pack
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'promo_price' => 'nullable|numeric|lt:price',
            'is_on_promotion' => 'boolean',
            'promo_start_at' => 'nullable|date',
            'promo_end_at' => 'nullable|date|after:promo_start_at',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.variant_id' => 'required|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        DB::transaction(function () use ($validated) {
            $pack = ProductPack::create([
                'name' => $validated['name'],
                'slug' => Str::slug($validated['name']) . '-' . rand(100, 999),
                'code' => 'PACK-' . strtoupper(Str::random(8)),
                'price' => $validated['price'],
                'promo_price' => $validated['promo_price'],
                'is_on_promotion' => $validated['is_on_promotion'] ?? false,
                'promo_start_at' => $validated['promo_start_at'],
                'promo_end_at' => $validated['promo_end_at'],
                'is_active' => true,
            ]);

            foreach ($validated['items'] as $item) {
                $pack->items()->create($item);
            }
        });

        // En Inertia, redirigimos con un mensaje flash
        return redirect()->route('packs.index')
            ->with('message', 'Pack creado exitosamente');
    }

    /**
     * Formulario de edición
     */
    /**
     * Formulario de edición de Pack.
     */
    public function edit(Request $request, ProductPack $productPack): Response
    {
        // 1. Manejo de la búsqueda (idéntico al create para añadir nuevos items)
        $search = trim($request->input('q', ''));
        $searchResults = collect();

        if (strlen($search) >= 3) {
            $searchTerm = "%{$search}%";
            $searchResults = ProductVariant::query()
                ->select('id', 'product_id', 'sku', 'price', 'promo_price', 'is_on_promo')
                ->where('sku', 'ilike', $searchTerm)
                ->with(['product:id,name', 'attributeValues:id,value'])
                ->limit(15)
                ->get()
                ->map(fn($variant) => [
                    'id'           => $variant->id,
                    'product_id'   => $variant->product_id, // Necesario para el store/update
                    'sku'          => $variant->sku,
                    'price'        => $variant->price,
                    'is_on_promo'  => $variant->is_on_promo,
                    'product_name' => $variant->product?->name ?? 'Sin nombre',
                    'variant_name' => $variant->attributeValues->pluck('value')->implode(' - ') ?: "Variante única",
                ]);
        }

        // 2. Cargar los items actuales formateados para el formulario
        // Esto asegura que el frontend vea los mismos campos que el searchResults
        $currentItems = $productPack->items()
            ->with(['variant.product', 'variant.attributeValues'])
            ->get()
            ->map(function ($item) {
                return [
                    'id'           => $item->variant->id, // ID de la variante para machear con la UI
                    'product_id'   => $item->product_id,
                    'variant_id'   => $item->variant_id,
                    'sku'          => $item->variant->sku,
                    'price'        => $item->variant->price,
                    'quantity'     => $item->quantity, // Campo específico de packs
                    'product_name' => $item->product?->name ?? 'Sin nombre',
                    'variant_name' => $item->variant->attributeValues->pluck('value')->implode(' - ') ?: "Variante única",
                ];
            });

        return Inertia::render('products/packs/Edit', [
            'pack' => [
                'id'              => $productPack->id,
                'name'            => $productPack->name,
                'price'           => $productPack->price,
                'promo_price'     => $productPack->promo_price,
                'is_on_promotion' => (bool)$productPack->is_on_promotion,
                // Formateo para datetime-local
                'promo_start_at'  => $productPack->promo_start_at?->format('Y-m-d\TH:i'),
                'promo_end_at'    => $productPack->promo_end_at?->format('Y-m-d\TH:i'),
                'items'           => $currentItems,
            ],
            'searchResults' => $searchResults,
            'filters'       => ['q' => $search]
        ]);
    }

    /**
     * Actualizar
     */
    public function update(Request $request, ProductPack $productPack)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric',
            'items' => 'required|array|min:1',
        ]);

        DB::transaction(function () use ($validated, $productPack) {
            $productPack->update($validated);

            if (isset($validated['items'])) {
                $productPack->items()->delete();
                foreach ($validated['items'] as $item) {
                    $productPack->items()->create($item);
                }
            }
        });

        return redirect()->route('packs.index')
            ->with('message', 'Pack actualizado correctamente');
    }

    /**
     * Eliminar
     */
    public function destroy(ProductPack $productPack)
    {
        $productPack->delete();

        return redirect()->back()
            ->with('message', 'Pack eliminado');
    }
}
