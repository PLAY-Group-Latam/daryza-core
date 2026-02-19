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
        Schema::create('product_packs', function (Blueprint $table) {
            $table->ulid('id')->primary()->index();
            $table->string('code')->nullable()->index(); // Código para el Pack (SKU propio)
            $table->string('name');
            $table->string('slug')->unique();



            $table->text('brief_description')->nullable();
            $table->longText('description')->nullable();

            $table->integer('stock')->default(0); // <-- Agregado: Stock disponible del pack
            // Precios
            $table->decimal('price', 10, 2);
            $table->decimal('promo_price', 10, 2)->nullable();

            // Flags
            $table->boolean('is_active')->default(true);
            $table->boolean('show_on_home')->default(false);
            $table->boolean('is_on_promotion')->default(false);

            // Promociones
            $table->timestamp('promo_start_at')->nullable();
            $table->timestamp('promo_end_at')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });


        Schema::create('product_pack_items', function (Blueprint $table) {
            $table->id();

            // Relación al Pack (ULID)
            $table->foreignUlid('product_pack_id')
                ->constrained('product_packs')
                ->cascadeOnDelete();

            /** * ¡IMPORTANTE! 
             * Cambié a foreignUlid porque tu tabla 'products' usa ULID.
             */
            $table->foreignUlid('product_id')
                ->constrained('products')
                ->cascadeOnDelete();

            // Relación a la variante (Asegúrate de que tus variantes también usen ULID o ID normal)
            // Si tus variantes usan ID normal (bigint), se queda como foreignId.
            $table->foreignUlid('variant_id')
                ->constrained('product_variants')
                ->cascadeOnDelete();

            $table->integer('quantity')->default(1);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_pack_items');
        Schema::dropIfExists('product_packs');
    }
};
