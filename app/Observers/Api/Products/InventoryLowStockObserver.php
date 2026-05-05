<?php

namespace App\Observers\Api\Products;

use App\Models\Products\ProductVariant;
use App\Mail\StockLow\LowStockAlert;
use App\Jobs\SendEmailJob;
use Illuminate\Support\Facades\Log;

class InventoryLowStockObserver
{
    public function updated(ProductVariant $variant): void
    {
        // Verificamos si hubo cambios en el stock
        if ($variant->wasChanged('stock')) {
            $oldStock = $variant->getOriginal('stock');
            $newStock = $variant->stock;

            // Disparar solo si el stock bajó (venta) y cruzó el umbral de 5
            if ($newStock < $oldStock && $newStock <= 5) {
                $this->dispatchEmail($variant);
            }
        }
    }

    protected function dispatchEmail(ProductVariant $variant): void
    {
        $recipient = config('emails.admin_email_inventory');

        if (!$recipient) {
            Log::warning("Alerta de stock: No se encontró un destinatario configurado en config('emails.admin_email_inventory')");
            return;
        }

        $data = [
            'type'        => 'Producto',
            'name'        => $variant->product->name, 
            'sku_or_code' => $variant->sku,
            'stock'       => $variant->stock
        ];

        // Se envía al Job que maneja el envío asíncrono
        dispatch(new SendEmailJob(
            new LowStockAlert($data),
            $recipient
        ));
    }
}