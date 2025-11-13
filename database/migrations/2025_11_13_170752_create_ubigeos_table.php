<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('departments', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('ubigeo_code', 6)->unique();
            $table->string('name');
            $table->string('iso_code', 10)->nullable();
            $table->string('label')->nullable();
            $table->string('searchable')->nullable();
            $table->unsignedInteger('children_count')->default(0);
            $table->timestamps();
        });

        Schema::create('provinces', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('ubigeo_code', 6)->unique();
            $table->string('name');
            $table->string('label')->nullable();
            $table->string('searchable')->nullable();
            $table->unsignedInteger('children_count')->default(0);
            $table->foreignUlid('department_id')
                ->constrained('departments')
                ->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('districts', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('ubigeo_code', 6)->unique();
            $table->string('name');
            $table->string('label')->nullable();
            $table->string('searchable')->nullable();
            $table->foreignUlid('province_id')
                ->constrained('provinces')
                ->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('districts');
        Schema::dropIfExists('provinces');
        Schema::dropIfExists('departments');
    }
};
