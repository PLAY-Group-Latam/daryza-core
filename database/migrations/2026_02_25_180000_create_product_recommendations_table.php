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
        Schema::create('product_recommendations', function (Blueprint $table) {
            $table->foreignUlid('product_id')
                ->constrained('products')
                ->cascadeOnDelete();
            $table->foreignUlid('recommended_product_id')
                ->constrained('products')
                ->cascadeOnDelete();
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();

            $table->unique(
                ['product_id', 'recommended_product_id'],
                'product_recommendations_unique_pair'
            );
            $table->index('recommended_product_id', 'product_recommendations_recommended_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_recommendations');
    }
};
