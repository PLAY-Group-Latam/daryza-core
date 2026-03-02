<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_offers', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('title')->index();
            $table->string('slug')->unique();
            $table->longText('description');
            $table->json('requirements');
            $table->json('benefits');
            $table->string('modality');
            $table->unsignedInteger('vacancies');
            $table->boolean('is_active')->default(true);
            $table->foreignUlid('area_id')->constrained('areas')->cascadeOnDelete();
            $table->foreignUlid('place_id')->constrained('places')->cascadeOnDelete();
            $table->timestamps();

            $table->index(['title', 'place_id']);
            $table->index('area_id');
            $table->index('place_id');
            $table->index('modality');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_offers');
    }
};
