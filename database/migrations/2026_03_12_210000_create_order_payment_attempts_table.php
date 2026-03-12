<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_payment_attempts', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->foreignUlid('order_id')
                ->nullable()
                ->constrained('orders')
                ->nullOnDelete();

            $table->string('purchase_number', 40);
            $table->string('transaction_token', 255)->unique();
            $table->enum('status', ['processing', 'completed', 'failed'])->default('processing');

            $table->boolean('is_approved')->nullable();
            $table->string('authorization_code')->nullable();
            $table->string('transaction_id')->nullable();
            $table->string('brand')->nullable();
            $table->string('masked_card')->nullable();
            $table->string('response_code')->nullable();
            $table->string('response_message')->nullable();

            $table->json('niubiz_payload')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('processed_at')->nullable();

            $table->timestamps();

            $table->index(['order_id', 'created_at'], 'order_payment_attempts_order_created_idx');
            $table->index(['purchase_number', 'created_at'], 'order_payment_attempts_purchase_created_idx');
            $table->index(['status', 'created_at'], 'order_payment_attempts_status_created_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_payment_attempts');
    }
};

