<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('departments', function (Blueprint $table) {
            $table->ulid('id')->primary();

            // Código ubigeo oficial (01, 02, etc.)
            $table->string('ubigeo_id', 6)->unique();

            $table->string('name');

            // ISO 3166-2 (PE-AMA, PE-LIM, etc.)
            $table->string('iso_code', 10)->nullable();

            $table->string('label')->nullable();
            $table->string('searchable')->nullable();

            $table->unsignedInteger('children_count')->default(0);

            $table->timestamps();
        });

        Schema::create('provinces', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->string('ubigeo_id', 6)->unique();
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

            $table->string('ubigeo_id', 6)->unique();
            $table->string('name');

            $table->string('label')->nullable();
            $table->string('searchable')->nullable();

            $table->foreignUlid('province_id')
                ->constrained('provinces')
                ->cascadeOnDelete();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('districts');
        Schema::dropIfExists('provinces');
        Schema::dropIfExists('departments');
    }
};
