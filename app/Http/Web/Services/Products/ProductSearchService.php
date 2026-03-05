<?php

namespace App\Http\Web\Services\Products;

use App\Models\Products\ProductVariant;
use Illuminate\Support\Facades\DB;
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
        $driver = DB::connection()->getDriverName();

        $query = ProductVariant::query()
            ->select('id', 'product_id', 'sku', 'promo_price', 'is_on_promo')
            ->where('is_active', true)
            ->whereHas('product', fn($q) => $q->where('is_active', true))
            ->with([
                'product:id,name',
                'attributes:id,value',
                'mainImage:id,mediable_id,mediable_type,file_path'
            ])
            ->limit($limit);

        if ($driver === 'pgsql') {
            $query->where('sku', 'ilike', $searchTerm);
        } else {
            $query->whereRaw('LOWER(sku) LIKE LOWER(?)', [$searchTerm]);
        }

        return $query
            ->get()
            ->map(fn($variant) => [
                'variant_id'           => $variant->id,
                'product_id'   => $variant->product_id, // <--- DEBES AGREGAR ESTA LÍNEA
                'sku'          => $variant->sku,
                'is_on_promo'  => $variant->is_on_promo,
                'product_name' => $variant->product?->name ?? 'Sin nombre',
                'variant_name' => $variant->attributes->pluck('value')->implode(' - ') ?: "Variante única",
                'image' => $variant->mainImage?->file_path,
            ]);
    }
}
