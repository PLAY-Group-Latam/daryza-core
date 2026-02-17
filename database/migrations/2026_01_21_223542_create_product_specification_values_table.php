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
            $table->foreignUlid('product_variant_id')
                ->constrained('product_variants')
                ->cascadeOnDelete();
            $table->foreignUlid('attribute_id')->constrained('attributes')->cascadeOnDelete();
            $table->foreignUlid('attribute_value_id')->nullable()->constrained('attributes_values')->cascadeOnDelete();
            $table->string('value')->nullable();
            $table->timestamps();

            $table->unique(['product_variant_id', 'attribute_id'], 'variant_attr_unique');
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
