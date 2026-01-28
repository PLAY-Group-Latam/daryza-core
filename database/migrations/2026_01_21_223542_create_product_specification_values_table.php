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
        Schema::create('product_specification_values', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignUlid('attribute_id')->constrained('attributes')->cascadeOnDelete();
            $table->foreignUlid('attribute_value_id')->nullable()->constrained('attributes_values')->cascadeOnDelete();
            $table->string('value')->nullable(); 
            $table->timestamps();

            $table->unique(['product_id', 'attribute_id']); // evita duplicados
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_specification_values');
    }
};
