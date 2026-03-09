<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_status_histories', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->foreignUlid('order_id')
                ->constrained('orders')
                ->cascadeOnDelete();

            $table->string('from_status')->nullable();
            $table->string('to_status');
            $table->enum('changed_by_type', ['customer', 'admin', 'system'])->default('system');
            $table->string('changed_by_id')->nullable();
            $table->text('note')->nullable();

            $table->timestamps();

            $table->index(['order_id', 'created_at'], 'order_status_histories_order_created_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_status_histories');
    }
};
