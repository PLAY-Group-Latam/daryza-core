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
        Schema::create('customers', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('full_name');
            $table->string('email')->unique();
            $table->string('phone')->unique()->nullable();
            $table->string('password')->nullable();
            $table->string('google_id')->nullable();
            $table->string('photo')->nullable();
            $table->string('dni', 8)->unique()->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('billing_profiles', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('ruc', 11)->unique(); 
            $table->string('social_reason');
            $table->foreignUlid('customer_id')
                ->constrained('customers')
                ->cascadeOnDelete();
            $table->timestamps();
        });

        Schema::create('addresses', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('address');
            $table->foreignUlid('department_id')
                ->constrained('departments')
                ->restrictOnDelete();
            $table->foreignUlid('province_id')
                ->constrained('provinces')
                ->restrictOnDelete();
            $table->foreignUlid('district_id')
                ->constrained('districts')
                ->restrictOnDelete();
            $table->string('country')->default('PER');
            $table->string('postal_code')->nullable();
            $table->string('reference')->nullable();
            $table->foreignUlid('customer_id')
                ->constrained('customers')
                ->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('addresses');
        Schema::dropIfExists('billing_profiles');
        Schema::dropIfExists('customers');
    }
};
