<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_payments', function (Blueprint $table) {
            $table->ulid('id')->primary();

            $table->foreignUlid('order_id')
                ->constrained('orders')
                ->cascadeOnDelete();

            $table->foreignUlid('payment_method_id')
                ->nullable()
                ->constrained('payment_methods')
                ->nullOnDelete();

            $table->enum('method', ['bank_transfer', 'niubiz']);
            $table->enum('status', ['pending', 'approved', 'rejected', 'failed', 'refunded'])
                ->default('pending');
            $table->decimal('amount', 12, 2);

            $table->string('voucher_url')->nullable();
            $table->timestamp('voucher_uploaded_at')->nullable();

            $table->string('gateway_transaction_id')->nullable();
            $table->string('gateway_authorization_code')->nullable();
            $table->string('gateway_brand')->nullable();
            $table->string('gateway_masked_card')->nullable();
            $table->json('gateway_payload')->nullable();

            $table->timestamp('paid_at')->nullable();
            $table->timestamp('rejected_at')->nullable();

            $table->timestamps();

            $table->index(['order_id', 'status'], 'order_payments_order_status_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_payments');
    }
};
