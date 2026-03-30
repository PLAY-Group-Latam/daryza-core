<?php

namespace App\Http\Api\v1\Controllers\Products;

use App\Http\Api\v1\Controllers\Controller;
use App\Models\Products\ProductCategory;
use App\Models\Products\DynamicCategory;
use App\Models\Products\ProductPack;
use App\Models\Products\Product;

class ProductCategoryController extends Controller
{
    public function index()
    {
        $standardCategories = ProductCategory::roots()
            ->active()
            ->with([
                'children' => fn($q) => $q->active()->orderBy('order'),
                'children.products' => fn($q) => $q->active()->take(4)->select('products.id', 'products.name', 'products.slug')
            ])
            ->orderBy('order')
            ->get(['id', 'name', 'slug', 'parent_id', 'order'])
            ->map(function($cat) {
                $cat->menu_type = 'standard';
                $cat->target_route = "/productos?categoria={$cat->slug}";
                
                $cat->children->map(function($sub) {
                    $sub->target_route = "/productos?subcategoria={$sub->slug}";
                    return $sub;
                });
                
                return $cat;
            });

        $dynamicCategories = DynamicCategory::where('is_active', true)
            ->with(['items.product' => fn($q) => $q->active()->select('id', 'name', 'slug')])
            ->get(['id', 'name', 'slug'])
            ->map(function($dyn) {
                return [
                    'id' => $dyn->id,
                    'name' => $dyn->name,
                    'slug' => $dyn->slug,
                    'menu_type' => 'dynamic',
                    'target_route' => "/productos?dinamica={$dyn->slug}",
                    'products' => $dyn->items->map(fn($item) => $item->product)->filter()
                ];
            });

        $packs = [
            'id' => 'group-packs',
            'name' => 'Packs',
            'slug' => 'packs',
            'menu_type' => 'special_pack',
            'target_route' => '/packs',
            'items' => ProductPack::where('is_active', true)
                ->select('id', 'name', 'slug', 'price')
                ->get()
                ->map(fn($p) => [
                    'id' => $p->id,
                    'name' => $p->name,
                    'slug' => $p->slug,
                    'price' => $p->price,
                    'target_route' => "/producto/{$p->slug}"
                ])
        ];

        $promotions = [
            'id' => 'group-promos',
            'name' => 'Promociones',
            'slug' => 'promociones',
            'menu_type' => 'special_promo',
            'target_route' => '/ofertas',
            'sections' => [
                [
                    'title' => 'Productos en Promoción',
                    'items' => Product::active()
                        ->whereHas('variants', fn($v) => $v->onPromo()) 
                        ->select('id', 'name', 'slug')
                        ->take(10)
                        ->get()
                        ->map(fn($p) => [
                            'id' => $p->id, 
                            'name' => $p->name, 
                            'slug' => $p->slug, 
                            'type' => 'product',
                            'target_route' => "/producto/{$p->slug}"
                        ])
                ],
                [
                    'title' => 'Packs en Promoción',
                    'items' => ProductPack::where('is_active', true)
                        ->where('is_on_promotion', true) 
                        ->select('id', 'name', 'slug')
                        ->get()
                        ->map(fn($p) => [
                            'id' => $p->id, 
                            'name' => $p->name, 
                            'slug' => $p->slug, 
                            'type' => 'pack',
                            'target_route' => "/producto/{$p->slug}"
                        ])
                ]
            ]
        ];

        return $this->success('Navegación obtenida', [
            'dynamics' => $dynamicCategories,
            'packs'    => $packs,
            'categories' => $standardCategories,
            'promotions' => $promotions
        ]);
    }
}