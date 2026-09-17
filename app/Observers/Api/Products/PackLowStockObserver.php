<?php

namespace App\Observers\Api\Products;

use App\Jobs\SendEmailJob;
use App\Mail\StockLow\LowStockAlert;
use App\Models\Products\ProductPack;
use App\Models\Settings\DestinationEmail;
use App\Services\Mail\DestinationEmailResolver;

class PackLowStockObserver
{
    public function updated(ProductPack $pack): void
    {
        if ($pack->wasChanged('stock')) {
            $oldStock = $pack->getOriginal('stock');
            $newStock = $pack->stock;

            if ($newStock < $oldStock && $newStock <= 5) {
                $this->dispatchEmail($pack);
            }
        }
    }

    protected function dispatchEmail(ProductPack $pack): void
    {
        $pageKey = $pack->stock <= 0
            ? DestinationEmail::PAGE_OUT_OF_STOCK
            : DestinationEmail::PAGE_LOW_STOCK;

        $recipient = app(DestinationEmailResolver::class)->resolve($pageKey);

        $data = [
            'type'        => 'Pack',
            'name'        => $pack->name,
            'slug'        => $pack->slug,
            'sku_or_code' => $pack->slug,
            'stock'       => $pack->stock,
        ];

        dispatch(new SendEmailJob(
            new LowStockAlert($data),
            $recipient
        ));
    }
}
