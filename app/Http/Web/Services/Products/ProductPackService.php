<?php

namespace App\Http\Web\Services\Products;

use App\Models\Products\ProductPack;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ProductPackService
{
    public function __construct(
        protected ProductMediaService $mediaService,
    ) {}

    public function create(array $data): ProductPack
    {
        $this->ensureNoDuplicateItems($data['items'] ?? []);

        return DB::transaction(function () use ($data) {
            $pack = ProductPack::create(collect($data)->except(['items', 'media'])->toArray());

            foreach ($data['items'] as $item) {
                $pack->items()->create([
                    'product_id' => $item['product_id'],
                    'variant_id' => $item['variant_id'],
                    'quantity' => $item['quantity'],
                ]);
            }

            $this->mediaService->syncPackMedia($pack, $data['media'] ?? []);

            return $pack;
        });
    }

    public function update(ProductPack $pack, array $data): ProductPack
    {
        $this->ensureNoDuplicateItems($data['items'] ?? []);

        return DB::transaction(function () use ($pack, $data) {
            $pack->update(collect($data)->except(['items', 'media'])->toArray());
            $pack->items()->delete();

            foreach ($data['items'] as $item) {
                $pack->items()->create([
                    'product_id' => $item['product_id'],
                    'variant_id' => $item['variant_id'],
                    'quantity' => $item['quantity'],
                ]);
            }

            $this->mediaService->syncPackMedia($pack, $data['media'] ?? []);

            return $pack;
        });
    }

    public function delete(ProductPack $pack): void
    {
        DB::transaction(function () use ($pack) {
            $pack->items()->delete();
            $this->mediaService->clearPackMedia($pack);
            $pack->delete();
        });
    }

    private function ensureNoDuplicateItems(array $items): void
    {
        $signatures = collect($items)
            ->map(fn($item) => ($item['product_id'] ?? '') . '|' . ($item['variant_id'] ?? ''));

        if ($signatures->count() !== $signatures->unique()->count()) {
            throw ValidationException::withMessages([
                'items' => 'No se permiten ítems duplicados (mismo producto y variante).',
            ]);
        }
    }
}
