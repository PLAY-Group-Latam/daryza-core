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
        Schema::create('product_business_line', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('product_id')->constrained('products')->onDelete('cascade');
            // Asumiendo que tienes una tabla 'business_lines'
            $table->foreignUlid('business_line_id')->constrained('business_lines')->onDelete('cascade');
            $table->timestamps();

            // Evita que un producto se asocie dos veces a la misma línea
            $table->unique(['product_id', 'business_line_id'], 'prod_bl_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_business_line');
    }
};
