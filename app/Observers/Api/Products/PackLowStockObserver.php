<?php

namespace App\Observers\Api\Products;

use App\Models\Products\ProductPack;
use App\Mail\StockLow\LowStockAlert;
use App\Jobs\SendEmailJob;
use Illuminate\Support\Facades\Log;

class PackLowStockObserver
{
    /**
     * Escucha el evento de actualización del Pack.
     */
    public function updated(ProductPack $pack): void
    {
        // Verificamos si el cambio fue en la columna stock
        if ($pack->wasChanged('stock')) {
            $oldStock = $pack->getOriginal('stock');
            $newStock = $pack->stock;

            // Solo disparamos el correo si el stock disminuyó (venta) y es 5 o menos
            if ($newStock < $oldStock && $newStock <= 5) {
                $this->dispatchEmail($pack);
            }
        }
    }

    /**
     * Prepara los datos y despacha el Job de envío de correo.
     */
    protected function dispatchEmail(ProductPack $pack): void
    {
        // Usamos la llave exacta de tu archivo config/emails.php
        $recipient = config('emails.admin_email_inventory');

        if (!$recipient) {
            Log::warning("Alerta de Inventario: No se encontró el correo destinatario en config('emails.admin_email_inventory')");
            return;
        }

        $data = [
            'type'        => 'Pack',
            'name'        => $pack->name, // Atributo 'name' de ProductPack
            'slug'        => $pack->slug, // Atributo 'slug' de ProductPack
            'stock'       => $pack->stock // Atributo 'stock' de ProductPack
        ];

        // Despachamos el Job que ya tienes configurado
        dispatch(new SendEmailJob(
            new LowStockAlert($data),
            $recipient
        ));
    }
}