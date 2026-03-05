<?php

namespace App\Http\Api\v1\Controllers\Products;

use App\Http\Api\v1\Controllers\Controller;
use App\Http\Api\v1\Services\Products\ProductVariantResolver;
use App\Models\Products\Product;
use App\Models\Products\ProductPack;
use App\Models\Products\ProductVariant;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(
        protected ProductVariantResolver $variantResolver
    ) {}

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
            ->cursorPaginate($request->input('per_page', 15))
            ->through(fn(Product $product) => $this->mapProductCard($product));

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
                    $q->select('id', 'product_id', 'price', 'promo_price','sku', 'is_on_promo');
                },
                'mainVariant.mainImage' => function ($q) {
                    $q->select('id', 'mediable_id', 'mediable_type', 'file_path');
                }
            ])
            ->latest() // Traer los más nuevos
            ->take($limit)
            ->get()
            ->map(fn(Product $product) => $this->mapProductCard($product));

        return $this->success('Productos para Home listados correctamente', $products);
    }

    /**
     * Packs destacados para la Home (Límite fijo y optimizado)
     */
    public function homePacks(Request $request)
    {
        $limit = min($request->input('limit', 5), 10);

        $packs = ProductPack::query()
            ->select(
                'id',
                'name',
                'slug',
                'brief_description',
                'price',
                'promo_price',
                'is_on_promotion',
                'promo_start_at',
                'promo_end_at',
                'stock'
            )
            ->activeOnHome()
            ->with([
                'mainImage' => function ($q) {
                    $q->select('id', 'mediable_id', 'mediable_type', 'file_path', 'order', 'type');
                },
                'media' => function ($q) {
                    $q->select('id', 'mediable_id', 'mediable_type', 'file_path', 'order', 'type')
                        ->whereIn('type', ['image', 'video'])
                        ->orderBy('order', 'asc');
                },
                'items' => function ($q) {
                    $q->select('id', 'product_pack_id', 'product_id', 'variant_id', 'quantity')
                        ->orderBy('id', 'asc');
                },
                'items.product' => function ($q) {
                    $q->select('id', 'name', 'slug', 'is_active');
                },
                'items.variant' => function ($q) {
                    $q->select(
                        'id',
                        'product_id',
                        'sku',
                        'price',
                        'promo_price',
                        'is_on_promo',
                        'promo_start_at',
                        'promo_end_at',
                        'is_active'
                    );
                },
            ])
            ->latest()
            ->take($limit)
            ->get()
            ->map(fn(ProductPack $pack) => $this->mapPackCard($pack));

        return $this->success('Packs para Home listados correctamente', $packs);
    }

    /**
     * Detalle de pack por slug (para página de detalle en frontend externo)
     */
    public function showPack(string $slug)
    {
        $pack = ProductPack::query()
            ->select(
                'id',
                'name',
                'slug',
                'brief_description',
                'description',
                'price',
                'promo_price',
                'is_on_promotion',
                'promo_start_at',
                'promo_end_at',
                'stock'
            )
            ->where('slug', $slug)
            ->where('is_active', true)
            ->with([
                'mainImage' => function ($q) {
                    $q->select('id', 'mediable_id', 'mediable_type', 'file_path', 'order', 'type');
                },
                'media' => function ($q) {
                    $q->select('id', 'mediable_id', 'mediable_type', 'file_path', 'order', 'type')
                        ->whereIn('type', ['image', 'video'])
                        ->orderBy('order', 'asc');
                },
                'items' => function ($q) {
                    $q->select('id', 'product_pack_id', 'product_id', 'variant_id', 'quantity')
                        ->orderBy('id', 'asc');
                },
                'items.product' => function ($q) {
                    $q->select('id', 'name', 'slug', 'is_active');
                },
                'items.variant' => function ($q) {
                    $q->select(
                        'id',
                        'product_id',
                        'sku',
                        'price',
                        'promo_price',
                        'is_on_promo',
                        'promo_start_at',
                        'promo_end_at',
                        'stock',
                        'is_active'
                    );
                },
                'items.variant.mainImage' => function ($q) {
                    $q->select('id', 'mediable_id', 'mediable_type', 'file_path');
                },
            ])
            ->firstOrFail();

        $items = $pack->items
            ->filter(fn($item) => $item->product && $item->variant)
            ->map(function ($item) {
                $product = $item->product;
                $variant = $item->variant;
                $variantImage = $variant?->mainImage;

                return [
                    'id' => $item->id,
                    'quantity' => $item->quantity,
                    'product' => $product ? [
                        'id' => $product->id,
                        'name' => $product->name,
                        'slug' => $product->slug,
                        'is_active' => (bool) $product->is_active,
                    ] : null,
                    'variant' => $variant ? [
                        'id' => $variant->id,
                        'sku' => $variant->sku,
                        'price' => $variant->price,
                        'promo_price' => $variant->promo_price,
                        'is_on_promo' => $variant->is_on_promo,
                        'promo_start_at' => $variant->promo_start_at,
                        'promo_end_at' => $variant->promo_end_at,
                        'active_price' => $variant->active_price,
                        'stock' => $variant->stock,
                        'is_active' => (bool) $variant->is_active,
                        'main_image' => $variantImage ? [
                            'id' => $variantImage->id,
                            'file_path' => $variantImage->file_path,
                        ] : null,
                    ] : null,
                    'subtotal' => $variant
                        ? ((float) $variant->active_price * (int) $item->quantity)
                        : 0,
                ];
            })
            ->values();

        $itemsReferenceTotal = $items->sum('subtotal');

        return $this->success('Pack obtenido correctamente', [
            'pack' => [
                'id' => $pack->id,
                'name' => $pack->name,
                'slug' => $pack->slug,
                'brief_description' => $pack->brief_description,
                'description' => $pack->description,
                'price' => $pack->price,
                'promo_price' => $pack->promo_price,
                'is_on_promotion' => $pack->is_on_promotion,
                'promo_start_at' => $pack->promo_start_at,
                'promo_end_at' => $pack->promo_end_at,
                'active_price' => $pack->active_price,
                'final_price' => $pack->final_price,
                'stock' => $pack->stock,
                'items_count' => $items->count(),
                'main_image' => $pack->mainImage ? [
                    'id' => $pack->mainImage->id,
                    'file_path' => $pack->mainImage->file_path,
                ] : null,
                'gallery' => $pack->media->map(fn($media) => [
                    'id' => $media->id,
                    'type' => $media->type,
                    'file_path' => $media->file_path,
                    'order' => $media->order,
                ])->values(),
            ],
            'items' => $items,
            'pricing' => [
                'pack_active_price' => $pack->active_price,
                'pack_final_price' => $pack->final_price,
                'items_reference_total' => $itemsReferenceTotal,
                'discount_vs_items' => (float) $itemsReferenceTotal - (float) $pack->final_price,
            ],
        ]);
    }

    /**
     * Detalle de un producto por slug (Para la página de producto)
     */
    public function show(Request $request, string $slug)
    {
        $recommendedLimit = max(0, min((int) $request->input('recommended_limit', 8), 12));

        $product = Product::query()
            ->select('id', 'name', 'slug', 'brief_description', 'description')
            ->with([
                'technicalSheets' => function ($q) {
                    $q->select('id', 'mediable_id', 'mediable_type', 'file_path', 'type', 'order')
                        ->orderBy('order', 'asc');
                },
                'recommendedProducts' => function ($q) use ($recommendedLimit, $slug) {
                    $q->select('products.id', 'products.name', 'products.slug')
                        ->where('products.is_active', true)
                        ->where('products.slug', '!=', $slug)
                        ->has('mainVariant')
                        ->with([
                            'mainVariant' => function ($variantQuery) {
                                $variantQuery->select(
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
                            'mainVariant.mainImage' => function ($imageQuery) {
                                $imageQuery->select(
                                    'id',
                                    'mediable_id',
                                    'mediable_type',
                                    'file_path'
                                );
                            },
                        ]);

                    if ($recommendedLimit > 0) {
                        $q->limit($recommendedLimit);
                    }
                },
            ])
            ->active()
            ->where('slug', $slug)
            ->firstOrFail();

        $activeVariants = $product->variants()
            ->where('is_active', true)
            ->orderBy('is_main', 'desc')
            ->orderBy('created_at', 'asc')
            ->orderBy('id', 'asc')
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
            )
            ->with([
                'selections' => function ($q) {
                    $q->select('id', 'product_variant_id', 'attribute_value_id');
                },
                'selections.attributeValue' => function ($q) {
                    $q->select('id', 'attribute_id', 'value');
                },
                'selections.attributeValue.attribute' => function ($q) {
                    $q->select('id', 'name');
                },
            ])
            ->get();

        $showState = $this->variantResolver->resolveShowState(
            $activeVariants,
            $this->variantResolver->parseSelectedAttributeValueIds($request),
            $request->query('focus')
        );

        $activeVariant = $showState['active_variant'];
        if ($activeVariant) {
            $activeVariant->loadMissing([
                'media' => function ($q) {
                    $q->select('id', 'mediable_id', 'file_path', 'type', 'order')
                        ->orderBy('order', 'asc');
                },
                'specifications' => function ($q) {
                    $q->select('id', 'product_variant_id', 'attribute_id', 'value');
                },
                'specifications.attribute' => function ($q) {
                    $q->select('id', 'name');
                },
            ]);
        }

        return $this->success('Producto obtenido correctamente', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'brief_description' => $product->brief_description,
                'description' => $product->description,
                'technical_sheets' => $product->technicalSheets,
                'recommended_products' => $product->recommendedProducts
                    ->map(fn(Product $recommendedProduct) => $this->mapProductCard($recommendedProduct))
                    ->values(),
            ],
            'active_variant' => $activeVariant,
            'selection_state' => $showState['selection_state'],
            'variant_availability_matrix' => $showState['variant_availability_matrix'],
        ]);
    }

    private function mapProductCard(Product $product): array
    {
        $mainVariant = $product->mainVariant;
        $mainImage = $mainVariant?->mainImage;

        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'main_variant' => $mainVariant ? [
                'id' => $mainVariant->id,
                'sku' => $mainVariant->sku,
                'price' => $mainVariant->price,
                'promo_price' => $mainVariant->promo_price,
                'is_on_promo' => $mainVariant->is_on_promo,
                'promo_start_at' => $mainVariant->promo_start_at,
                'promo_end_at' => $mainVariant->promo_end_at,
                'active_price' => $mainVariant->active_price,
            ] : null,
            'main_image' => $mainImage ? [
                'id' => $mainImage->id,
                'file_path' => $mainImage->file_path,
            ] : null,
        ];
    }

    private function mapPackCard(ProductPack $pack): array
    {
        $mainImage = $pack->mainImage;
        $gallery = $pack->media
            ->map(fn($media) => [
                'id' => $media->id,
                'type' => $media->type,
                'file_path' => $media->file_path,
                'order' => $media->order,
            ])
            ->values();
        $activeItems = $pack->items->filter(
            fn($item) => $item->variant && $item->product && $item->product->is_active
        );

        return [
            'id' => $pack->id,
            'name' => $pack->name,
            'slug' => $pack->slug,
            'brief_description' => $pack->brief_description,
            'price' => $pack->price,
            'promo_price' => $pack->promo_price,
            'is_on_promotion' => $pack->is_on_promotion,
            'promo_start_at' => $pack->promo_start_at,
            'promo_end_at' => $pack->promo_end_at,
            'active_price' => $pack->active_price,
            'final_price' => $pack->final_price,
            'stock' => $pack->stock,
            'items_count' => $activeItems->count(),
            'main_image' => $mainImage ? [
                'id' => $mainImage->id,
                'file_path' => $mainImage->file_path,
            ] : null,
            'gallery' => $gallery,
        ];
    }
}
