<?php

namespace App\Observers\Web\Product;

use App\Http\Web\Services\Products\ProductCodeGenerator;
use App\Http\Web\Support\Products\ProductMainVariantNormalizer;
use App\Http\Web\Support\Products\UniqueSlugResolver;
use App\Models\Products\Product;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ProductObserver
{
    public function creating(Product $product): void
    {
        if (empty($product->code)) {
            $generator = app(ProductCodeGenerator::class);
            $product->code = $generator->generate();
        }
        if (empty($product->slug)) {
            $product->slug = Str::slug($product->name);
        }
    }

    public function updated(Product $product): void
    {
        app(ProductMainVariantNormalizer::class)->normalize($product);
    }
    /**
     * Se ejecuta cuando se llama al método ->delete()
     */
    public function deleting(Product $product): void
    {
        // 1. Verificamos si es un borrado definitivo (Force Delete)
        if ($product->isForceDeleting()) {
            Log::warning("Eliminación definitiva de producto: {$product->id}");
            $product->variants()->forceDelete();
            return;
        }

        // 2. Si es Soft Delete: Borramos las variantes en cascada
        // Esto activará también los Observers de las variantes si existen.
        $product->variants()->delete();

        // 3. Tip Senior: Liberar el Slug (Opcional pero recomendado)
        // Al usar SoftDeletes, el slug 'guante-latex' sigue ocupado. 
        // Lo renombramos para que otro producto pueda usarlo.
        $product->slug = app(UniqueSlugResolver::class)->resolve(
            Product::class,
            $product->slug . '-deleted-' . now()->timestamp,
            $product->id,
            'producto'
        );
        $product->save();

        Log::info("Producto movido a papelera: {$product->id}");
    }

    /**
     * Se ejecuta cuando restauramos un producto de la papelera.
     */
    public function restoring(Product $product): void
    {
        // Restauramos automáticamente todas las variantes vinculadas
        $product->variants()->restore();
        $product->slug = app(UniqueSlugResolver::class)->resolve(
            Product::class,
            Str::slug($product->name),
            $product->id,
            'producto'
        );

        Log::info("Producto restaurado de papelera: {$product->id}");
    }
}
