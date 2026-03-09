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
        Schema::create('product_media', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('mediable_id'); // para ULID
            $table->string('mediable_type'); // nombre del modelo 
            $table->string('type'); // 'image', 'technical_sheet', 'video', etc
            $table->string('file_path'); // URL o path en storage
            $table->string('folder')->nullable(); // Agrégalo si lo guardas en el Service
            $table->boolean('is_main')->default(false); // solo aplica a imágenes
            $table->integer('order')->default(0); // ordenar en galerías

            $table->index(
                ['mediable_type', 'mediable_id', 'type', 'order'],
                'product_media_mediable_type_id_type_order_idx'
            );

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_media');
    }
};
