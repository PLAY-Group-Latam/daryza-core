<?php

namespace App\Observers\Api\Products;

use App\Jobs\SendEmailJob;
use App\Mail\StockLow\LowStockAlert;
use App\Models\Products\ProductVariant;
use App\Models\Settings\DestinationEmail;
use App\Services\Mail\DestinationEmailResolver;

class InventoryLowStockObserver
{
    public function updated(ProductVariant $variant): void
    {
        if ($variant->wasChanged('stock')) {
            $oldStock = $variant->getOriginal('stock');
            $newStock = $variant->stock;

            if ($newStock < $oldStock && $newStock <= 5) {
                $this->dispatchEmail($variant);
            }
        }
    }

    protected function dispatchEmail(ProductVariant $variant): void
    {
        $pageKey = $variant->stock <= 0
            ? DestinationEmail::PAGE_OUT_OF_STOCK
            : DestinationEmail::PAGE_LOW_STOCK;

        $recipient = app(DestinationEmailResolver::class)->resolve($pageKey);

        $data = [
            'type'        => 'Producto',
            'name'        => $variant->product->name,
            'sku_or_code' => $variant->sku,
            'stock'       => $variant->stock,
        ];

        dispatch(new SendEmailJob(
            new LowStockAlert($data),
            $recipient
        ));
    }
}
