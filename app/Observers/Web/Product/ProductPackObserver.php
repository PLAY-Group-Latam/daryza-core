<?php

namespace App\Observers\Web\Product;

use App\Models\Products\ProductPack;
use Illuminate\Support\Str;

class ProductPackObserver
{
    public function creating(ProductPack $pack): void
    {
        // Generación automática del código si está vacío
        if (empty($pack->code)) {
            // Ejemplo: PK-24-A8B9 (Puedes usar tu generador si prefieres)
            $pack->code = 'PK-' . date('y') . '-' . strtoupper(Str::random(6));
        }

        // Asegurar que tenga slug si el frontend no lo envió (fallback)
        if (empty($pack->slug)) {
            $pack->slug = Str::slug($pack->name);
        }
    }

    public function deleting(ProductPack $pack): void
    {
        // Si es Soft Delete, renombramos el slug para liberar el original
        if (!$pack->isForceDeleting()) {
            $pack->slug = $pack->slug . '-deleted-' . now()->timestamp;
            $pack->save();
        }
    }

    public function restoring(ProductPack $pack): void
    {
        // Al restaurar, limpiamos el slug de borrado
        $pack->slug = Str::slug($pack->name);
    }
}
