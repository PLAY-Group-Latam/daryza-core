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
        Schema::create('products', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->string('code')->nullable()->index(); // código interno
            $table->string('name');
            $table->string('slug')->unique();

            $table->text('brief_description')->nullable();
            $table->longText('description')->nullable();

            $table->boolean('is_active')->default(true);
            $table->boolean('is_home')->default(false)->index();
            $table->timestamps();
            $table->softDeletes();

            $table->index(
                ['is_active', 'is_home', 'deleted_at'],
                'products_active_home_deleted_idx'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
