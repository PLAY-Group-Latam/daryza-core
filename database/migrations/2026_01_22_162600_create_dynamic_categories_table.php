<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Tabla principal de Categorías Dinámicas
        Schema::create('dynamic_categories', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->boolean('is_active')->default(true);

            // Vigencia de la categoría (Campañas temporales)
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();

            $table->timestamps();
            $table->softDeletes(); // Recomendado para no romper historial
        });

        // 2. Tabla Pivot: Relación entre Categoría y Variantes (Items)
        Schema::create('dynamic_category_items', function (Blueprint $table) {
            $table->id();

            // Relación a la Categoría Dinámica (ULID)
            $table->foreignUlid('dynamic_category_id')
                ->constrained('dynamic_categories')
                ->cascadeOnDelete();

            // Relación al Producto (ULID) - Agregado para consistencia y velocidad
            $table->foreignUlid('product_id')
                ->constrained('products')
                ->cascadeOnDelete();

            /** * Relación a la variante. 
             * Uso foreignUlid asumiendo que tus variantes usan ULID al igual que en Packs.
             */
            $table->foreignUlid('variant_id')
                ->constrained('product_variants')
                ->cascadeOnDelete();

            // Opcional: Si necesitas un orden específico de productos en la web

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dynamic_category_items');
        Schema::dropIfExists('dynamic_categories');
    }
};
