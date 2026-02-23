<?php

namespace App\Http\Api\v1\Controllers\Products;

use App\Http\Api\v1\Controllers\Controller;
use App\Models\Products\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Listado de productos para la API (Soporta Infinite Scroll)
     */
    public function index(Request $request)
    {
        // 1. Iniciamos la query con las relaciones mínimas necesarias para el catálogo
        $query = Product::query()
            ->select('id', 'name', 'slug')
            ->active()
            ->has('mainVariant') // Integridad: Si no tiene principal, no sale en catálogo
            ->with([
                'mainVariant' => function ($q) {
                    $q->select(
                        'id',
                        'product_id',
                        'sku',
                        'price',
                        'promo_price',
                        'is_on_promo',
                        'promo_start_at',
                        'promo_end_at'
                    );
                },
                // ✅ Traemos solo el objeto de la primera imagen
                'mainVariant.mainImage' => function ($q) {
                    $q->select('id', 'mediable_id', 'mediable_type', 'file_path');
                }
            ]);

        // 2. Filtro por categoría (Si el usuario hace click en una categoría)
        if ($request->has('category_slug')) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where('slug', $request->category_slug);
            });
        }
        if ($request->has('ids')) {
    $query->whereIn('id', explode(',', $request->ids));
}

        // 3. Búsqueda simple
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // 4. Paginación Senior (Cursor)
        // El cursorPaginate detecta automáticamente el parámetro 'cursor' en la URL
        $products = $query->orderBy('id', 'desc')
            ->cursorPaginate($request->input('per_page', 15));

        return $this->success('Productos listados correctamente', $products);
    }

    /**
     * Productos destacados para la Home (Límite fijo y optimizado)
     */
    public function home(Request $request)
    {
        // Definimos un límite (por defecto 8, máximo 12 para no saturar)
        $limit = min($request->input('limit', 5), 10);

        $products = Product::query()
            ->select('id', 'name', 'slug')
            ->home()
            ->has('mainVariant')
            ->with([
                'mainVariant' => function ($q) {
                    $q->select('id', 'product_id', 'price', 'promo_price', 'is_on_promo');
                },
                'mainVariant.mainImage' => function ($q) {
                    $q->select('id', 'mediable_id', 'mediable_type', 'file_path');
                }
            ])
            ->latest() // Traer los más nuevos
            ->take($limit)
            ->get(); // Usamos get() porque en la Home no solemos paginar

        return $this->success('Productos para Home listados correctamente', $products);
    }

    /**
     * Detalle de un producto por slug (Para la página de producto)
     */
    public function show(Request $request, string $slug)
    {
        $product = Product::query()
            ->select('id', 'name', 'slug', 'brief_description', 'description')
            ->with([
                'technicalSheets' => function ($q) {
                    $q->select('id', 'mediable_id', 'mediable_type', 'file_path', 'type', 'order')
                        ->orderBy('order', 'asc');
                }
            ])
            ->active()
            ->where('slug', $slug)
            ->firstOrFail();



        // Determinar qué variante cargar:
        // - Si llega ?variant=id → esa variante (debe pertenecer al producto)
        // - Si no → la variante principal
        $variantQuery = $product->variants()
            ->where('is_active', true)
            ->select(
                'id',
                'product_id',
                'sku',
                'price',
                'promo_price',
                'is_on_promo',
                'promo_start_at',
                'promo_end_at',
                'stock',
                'is_main'
            );

        if ($request->filled('variant')) {
            $variant = (clone $variantQuery)
                ->where('id', $request->variant)
                ->first();

            // Si el id no corresponde a este producto, caemos al principal
            if (!$variant) {
                $variant = (clone $variantQuery)->where('is_main', true)->first();
            }
        } else {
            $variant = $variantQuery->where('is_main', true)->first();
        }

        // Cargar relaciones de la variante activa
        $variant?->load([
            'media' => function ($q) {
                $q->select('id', 'mediable_id', 'file_path', 'type', 'order')
                    ->orderBy('order', 'asc');
            },
            'selections.attributeValue' => function ($q) {
                $q->select('id', 'attribute_id', 'value');
            },
            'selections.attributeValue.attribute' => function ($q) {
                $q->select('id', 'name');
            },
            'specifications' => function ($q) {
                $q->select('id', 'product_variant_id', 'attribute_id', 'value');
            },
            'specifications.attribute' => function ($q) {
                $q->select('id', 'name');
            },
        ]);

        // Cargar los selectores de todas las variantes (solo lo mínimo para los botones)
        // El frontend necesita saber qué opciones mostrar aunque no cargue su data completa
        // Reemplaza variantSelectors por variants con un with anidado
        $product->load([
            'variants' => function ($q) {
                $q->where('is_active', true)
                    ->orderBy('is_main', 'desc')
                    ->orderBy('created_at', 'asc')
                    ->orderBy('id', 'asc')
                    ->select('id', 'product_id', 'is_main');
            },
            'variants.selections.attributeValue' => function ($q) {
                $q->select('id', 'attribute_id', 'value');
            },
            'variants.selections.attributeValue.attribute' => function ($q) {
                $q->select('id', 'name');
            },
        ]);

        return $this->success('Producto obtenido correctamente', [
            'id'                => $product->id,
            'name'              => $product->name,
            'slug'              => $product->slug,
            'brief_description' => $product->brief_description,
            'description'       => $product->description,
            'technical_sheets'  => $product->technicalSheets, // 👈 FALTABA ESTO
            'active_variant'    => $variant,          // variante activa con toda su data
            'variant_selectors' => $product->variants, // ← usa la relación que ya existe
        ]);
    }
}
