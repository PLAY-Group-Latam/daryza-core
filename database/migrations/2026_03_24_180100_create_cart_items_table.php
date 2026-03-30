<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cart_items', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->foreignUlid('cart_id')
                ->constrained('carts')
                ->cascadeOnDelete();

            $table->ulidMorphs('item');

            $table->unsignedInteger('quantity')->default(1);
            $table->string('currency', 3)->default('PEN');
            $table->decimal('unit_price', 12, 2)->nullable();
            $table->json('metadata')->nullable();

            $table->timestamps();

            $table->unique(['cart_id', 'item_id', 'item_type'], 'cart_items_cart_item_unique');
            $table->index(['cart_id', 'created_at'], 'cart_items_cart_created_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cart_items');
    }
};
