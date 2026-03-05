<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->foreignUlid('order_id')
                ->constrained('orders')
                ->cascadeOnDelete();

            $table->foreignUlid('product_id')
                ->nullable()
                ->constrained('products')
                ->nullOnDelete();

            $table->foreignUlid('variant_id')
                ->nullable()
                ->constrained('product_variants')
                ->nullOnDelete();

            $table->enum('item_type', ['product_variant'])->default('product_variant');
            $table->string('product_name');
            $table->string('variant_sku');
            $table->unsignedInteger('quantity');
            $table->decimal('unit_price', 12, 2);
            $table->decimal('line_total', 12, 2);
            $table->json('metadata')->nullable();

            $table->timestamps();

            $table->index(['order_id', 'variant_id'], 'order_items_order_variant_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
