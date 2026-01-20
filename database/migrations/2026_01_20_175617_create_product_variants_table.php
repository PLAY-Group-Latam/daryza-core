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
        Schema::create('product_variants', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('product_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('sku')->unique();

            // Precio
            $table->decimal('price', 10, 2);
            $table->decimal('promo_price', 10, 2)->nullable();
            $table->boolean('is_on_promo')->default(false);

            // Stock
            $table->integer('stock')->default(0);

            // Medidas físicas
            $table->decimal('weight', 8, 2)->nullable(); // gramos o kilos
            $table->decimal('width', 8, 2)->nullable();
            $table->decimal('height', 8, 2)->nullable();
            $table->decimal('length', 8, 2)->nullable();
            $table->decimal('depth', 8, 2)->nullable();

            // Atributos dinámicos: color, aroma, talla, presentación, etc
            $table->json('attributes');

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};
