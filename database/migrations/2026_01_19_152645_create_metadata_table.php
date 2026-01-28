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
        Schema::create('metadata', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->string('metadatable_id');
            $table->string('metadatable_type');

            $table->string('meta_title')->nullable();
            $table->string('meta_description', 500)->nullable();
            $table->string('meta_keywords')->nullable();

            // Open Graph (para compartir en redes)
            $table->string('og_title')->nullable();
            $table->string('og_description', 500)->nullable();
            $table->string('og_image')->nullable(); // URL de imagen
            $table->string('og_type')->default('product');

            // Opcional pero muy útil
            $table->string('canonical_url')->nullable();
            $table->boolean('noindex')->default(false);
            $table->boolean('nofollow')->default(false);

            $table->timestamps();
            $table->softDeletes();

            $table->index(
                ['metadatable_type', 'metadatable_id'],
                'metadata_metadatable_idx'
            );
            $table->unique(
                ['metadatable_id', 'metadatable_type'],
                'metadata_metadatable_unique'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('metadata');
    }
};
