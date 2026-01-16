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
        Schema::create('delivery_zones', function (Blueprint $table) {
            $table->foreignUlid('id')->primary();
            $table->enum('zone_type', ['department', 'province', 'district'])
                ->default('district')
                ->comment('Tipo de zona de delivery: department, province y district');
            $table->ulid('zone_id');
            $table->boolean('is_main')->default(false);
            $table->decimal('delivery_cost', 10, 2)->default(0.00);
            // $table->decimal('free_delivery_threshold', 10, 2)->default(0.00);
            $table->timestamps();
            $table->unique(['zone_type', 'zone_id'], 'unique_zone_type_zone_id');
        });

        Schema::create('delivery_settings', function (Blueprint $table) {
            $table->ulid('id')->primary();
            // $table->decimal('base_delivery_cost', 10, 2)->default(0.00);
            $table->decimal('minimum_order_amount', 10, 2)->default(0.00);
            $table->decimal('order_amount_threshold', 10, 2)->default(0.00);
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('delivery_zones');
        Schema::dropIfExists('delivery_settings');
    }
};

