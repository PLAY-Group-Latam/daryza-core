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
        Schema::create('product_dynamic_category', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('product_id')->constrained('products')->onDelete('cascade');
            // Asumiendo que tienes una tabla 'dynamic_categories'
            $table->foreignUlid('dynamic_category_id')->constrained('dynamic_categories')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['product_id', 'dynamic_category_id'], 'prod_dynamic_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_dynamic_category');
    }
};
