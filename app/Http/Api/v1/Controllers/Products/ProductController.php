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
}
