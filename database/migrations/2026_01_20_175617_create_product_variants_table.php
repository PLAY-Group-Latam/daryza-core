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
            $table->string('sku_supplier')->unique()->nullable();
            $table->decimal('price', 10, 2);
            $table->decimal('promo_price', 10, 2)->nullable();
            $table->boolean('is_on_promo')->default(false);
            $table->timestamp('promo_start_at')->nullable();
            $table->timestamp('promo_end_at')->nullable();
            $table->boolean('is_active')->default(true)->index(); // Indexar estados
            $table->boolean('is_main')->default(false)->index();
            $table->integer('stock')->default(0);
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
