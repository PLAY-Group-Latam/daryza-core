<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('areas', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name')->unique()->index();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });

        Schema::create('area_place', function (Blueprint $table) {
            $table->foreignUlid('area_id')->constrained('areas')->cascadeOnDelete();
            $table->foreignUlid('place_id')->constrained('places')->cascadeOnDelete();
            $table->timestamps();

            $table->primary(['area_id', 'place_id']);
            $table->index(['place_id', 'area_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('area_place');
        Schema::dropIfExists('areas');
    }
};
