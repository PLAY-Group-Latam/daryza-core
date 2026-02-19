<?php

namespace App\Http\Web\Services\Products;

use App\Models\Products\ProductVariant;
use Illuminate\Support\Collection;

class ProductSearchService
{
    /**
     * Busca variantes por SKU y devuelve un formato estandarizado para el frontend.
     */
    public function searchVariantsBySku(string $search, int $limit = 15): Collection
    {
        $search = trim($search);

        if (strlen($search) < 3) {
            return collect();
        }

        $searchTerm = "%{$search}%";

        return ProductVariant::query()
            ->select('id', 'product_id', 'sku', 'promo_price', 'is_on_promo')
            ->where('sku', 'ilike', $searchTerm)
            ->with([
                'product:id,name',
                'attributes:id,value'
            ])
            ->limit($limit)
            ->get()
            ->map(fn($variant) => [
                'variant_id'           => $variant->id,
                'product_id'   => $variant->product_id, // <--- DEBES AGREGAR ESTA LÍNEA
                'sku'          => $variant->sku,
                'is_on_promo'  => $variant->is_on_promo,
                'product_name' => $variant->product?->name ?? 'Sin nombre',
                'variant_name' => $variant->attributes->pluck('value')->implode(' - ') ?: "Variante única",
            ]);
    }
}
