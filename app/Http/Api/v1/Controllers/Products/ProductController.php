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

    public function index(Request $request)
    {
        $query = Product::query()
            ->select('id', 'name', 'slug')
            ->active()
            ->has('mainVariant')
            ->with([
                'mainVariant' => function ($q) {
                    $q->select('id', 'product_id', 'sku', 'price', 'promo_price', 'is_on_promo', 'promo_start_at', 'promo_end_at');
                },
                'mainVariant.mainImage' => function ($q) {
                    $q->select('id', 'mediable_id', 'mediable_type', 'file_path');
                }
            ]);

        if ($request->has('category_slug')) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where('slug', $request->category_slug);
            });
        }

        if ($request->has('ids')) {
            $query->whereIn('id', explode(',', $request->ids));
        }

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $products = $query->orderBy('id', 'desc')
            ->cursorPaginate($request->input('per_page', 15))
            ->through(fn(Product $product) => $this->mapProductCard($product));

        return $this->success('Productos listados correctamente', $products);
    }

    public function home()
    {
        $limit = 10;
        $products = Product::query()
            ->select('id', 'name', 'slug')
            ->home()
            ->has('mainVariant')
            ->with([
                'mainVariant' => function ($q) {
                    $q->select('id', 'product_id', 'price', 'promo_price', 'sku', 'is_on_promo', 'promo_start_at', 'promo_end_at');
                },
                'mainVariant.mainImage' => function ($q) {
                    $q->select('id', 'mediable_id', 'mediable_type', 'file_path');
                }
            ])
            ->latest()
            ->take($limit)
            ->get()
            ->map(fn(Product $product) => $this->mapProductCard($product));

        return $this->success('Productos para Home listados correctamente', $products);
    }

    public function homePacks()
    {
        $limit = 10;

        $packs = ProductPack::query()
            ->select('id', 'name', 'slug', 'brief_description', 'price', 'promo_price', 'is_on_promotion', 'promo_start_at', 'promo_end_at', 'stock')
            ->activeOnHome()
            ->with([
                'mainImage',
                'media',
                'items.product',
                'items.variant'
            ])
            ->latest()
            ->take($limit)
            ->get()
            ->map(fn(ProductPack $pack) => $this->mapPackCard($pack));

        return $this->success('Packs para Home listados correctamente', $packs);
    }

  public function showPack(string $slug)
{
    $pack = ProductPack::query()
        ->where('slug', $slug)
        ->where('is_active', true)
        ->with([
            'mainImage',
            'media',
            'items.product.brand',
            'items.variant.mainImage',
        ])
        ->firstOrFail();


    $items = $pack->items
        ->filter(fn($item) => $item->product && $item->variant)
        ->map(function ($item) {
            $variantData = array_merge(
                [
                    'id' => $item->variant->id,
                    'sku' => $item->variant->sku,
                    'stock' => $item->variant->stock,
                    'is_active' => (bool) $item->variant->is_active,
                    'main_image' => $item->variant->mainImage ? [
                        'id' => $item->variant->mainImage->id,
                        'file_path' => $item->variant->mainImage->file_path,
                    ] : null,
                ],
                $this->variantResolver->resolvePriceData($item->variant)
            );

            return [
                'id' => $item->id,
                'quantity' => $item->quantity,
                'product' => [
                    'id' => $item->product->id,
                    'name' => $item->product->name,
                    'slug' => $item->product->slug,
                ],
                'variant' => $variantData,
                'subtotal' => (float) $variantData['active_price'] * (int) $item->quantity,
            ];
        })
        ->values();

    $brands = $pack->items
        ->filter(fn($item) => $item->product && $item->product->brand)
        ->map(fn($item) => $item->product->brand)
        ->unique('id') // 👈 elimina duplicados
        ->values()
        ->map(fn($brand) => [
            'id' => $brand->id,
            'name' => $brand->name,
            'slug' => $brand->slug,
            'image' => $brand->image,
        ]);

    
    $packPriceData = $this->variantResolver->resolvePackPriceData($pack);
    $itemsReferenceTotal = $items->sum('subtotal');

    return $this->success('Pack obtenido correctamente', [
        'pack' => array_merge([
            'id' => $pack->id,
            'name' => $pack->name,
            'slug' => $pack->slug,
            'brief_description' => $pack->brief_description,
            'description' => $pack->description,
            'stock' => $pack->stock,
            'main_image' => $pack->mainImage,
            'gallery' => $pack->media,

           'brands' => $brands->values()->all(),

        ], $packPriceData),

        'items' => $items,

        'pricing' => [
            'pack_active_price' => $packPriceData['active_price'],
            'items_reference_total' => $itemsReferenceTotal,
            'discount_vs_items' => (float) $itemsReferenceTotal - (float) $packPriceData['final_price'],
        ],
    ]);
}

  public function show(Request $request, string $slug)
{
    $recommendedLimit = max(0, min((int) $request->input('recommended_limit', 8), 12));

    $product = Product::query()
        ->active()
        ->where('slug', $slug)
        ->with([
            'brand', 
            'technicalSheets',
            'recommendedProducts.brand', 
            'recommendedProducts.mainVariant.mainImage',
        ])
        ->firstOrFail();

    $activeVariants = $product->variants()
        ->where('is_active', true)
        ->with(['selections.attributeValue.attribute'])
        ->get();

    $showState = $this->variantResolver->resolveShowState(
        $activeVariants,
        $this->variantResolver->parseSelectedAttributeValueIds($request),
        $request->query('focus')
    );

    $activeVariant = $showState['active_variant'];

    if ($activeVariant) {
       $activeVariant->loadMissing(['media', 'specifications.attribute']);

// 🔥 1. Filtrar spec "Marca" antigua
$filteredSpecs = $activeVariant->specifications
    ->filter(fn($spec) => $spec->attribute->name !== 'Marca')
    ->values();

// 🔥 2. Inyectar marca desde relación real
if ($product->brand) {
    $filteredSpecs->prepend((object) [
        'id' => 'brand_virtual', // 👈 fake id
        'product_variant_id' => $activeVariant->id,
        'attribute_id' => null,
        'attribute_value_id' => null,
        'value' => $product->brand->name,
        'attribute' => (object) [
            'id' => 'brand_virtual',
            'name' => 'Marca',
            'type' => 'text',
            'is_variant' => false,
            'is_filterable' => false,
        ],
    ]);
}

// 🔥 3. Reasignar
$activeVariant->setRelation('specifications', $filteredSpecs);

// 🔥 precio
$activeVariant->price_resolution = $this->variantResolver->resolvePriceData($activeVariant);
    }

    return $this->success('Producto obtenido correctamente', [
        'product' => [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'brief_description' => $product->brief_description,
            'description' => $product->description,
            'technical_sheets' => $product->technicalSheets,

           
            'brand' => $product->brand ? [
                'id' => $product->brand->id,
                'name' => $product->brand->name,
                'slug' => $product->brand->slug,
                'image' => $product->brand->image,
            ] : null,

           
            'recommended_products' => $product->recommendedProducts
                ->take($recommendedLimit) 
                ->map(fn($rp) => $this->mapProductCard($rp))
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

    return [
        'id' => $product->id,
        'name' => $product->name,
        'slug' => $product->slug,

        'brand' => $product->brand ? [
            'id' => $product->brand->id,
            'name' => $product->brand->name,
            'slug' => $product->brand->slug,
            'image' => $product->brand->image,
        ] : null,

        'main_variant' => $mainVariant ? array_merge(
            [
                'id' => $mainVariant->id,
                'sku' => $mainVariant->sku,
                'stock' => $mainVariant->stock,
            ],
            $this->variantResolver->resolvePriceData($mainVariant)
        ) : null,

        'main_image' => $mainVariant?->mainImage ? [
            'id' => $mainVariant->mainImage->id,
            'file_path' => $mainVariant->mainImage->file_path,
        ] : null,
    ];
}

 private function mapPackCard(ProductPack $pack): array
{
    $activeItems = $pack->items->filter(
        fn($item) => $item->variant && $item->product && $item->product->is_active
    );

    $brands = $activeItems
        ->filter(fn($item) => $item->product->brand)
        ->map(fn($item) => $item->product->brand)
        ->unique('id')
        ->values()
        ->map(fn($brand) => [
            'id' => $brand->id,
            'name' => $brand->name,
            'slug' => $brand->slug,
            'image' => $brand->image,
        ]);

    return array_merge([
        'id' => $pack->id,
        'name' => $pack->name,
        'slug' => $pack->slug,
        'brief_description' => $pack->brief_description,
        'stock' => $pack->stock,
        'items_count' => $activeItems->count(),

       'brands' => $brands->values()->all() ?? [],

        'main_image' => $pack->mainImage ? [
            'id' => $pack->mainImage->id,
            'file_path' => $pack->mainImage->file_path,
        ] : null,

        'gallery' => $pack->media,

    ], $this->variantResolver->resolvePackPriceData($pack));
}
}
