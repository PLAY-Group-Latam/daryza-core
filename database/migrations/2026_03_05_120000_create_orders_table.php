<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('code')->unique();
            $table->string('niubiz_purchase_number', 12)->nullable();

            $table->foreignUlid('customer_id')
                ->constrained('customers')
                ->cascadeOnDelete();

            $table->string('customer_email');
            $table->string('customer_first_name');
            $table->string('customer_last_name');
            $table->enum('customer_document_type', ['dni', 'ce']);
            $table->string('customer_document_number', 20);
            $table->string('customer_mobile_phone', 20);

            $table->enum('voucher_type', ['boleta', 'factura'])->default('boleta');
            $table->string('billing_ruc', 11)->nullable();
            $table->string('billing_social_reason')->nullable();
            $table->string('billing_fiscal_address')->nullable();

            $table->foreignUlid('department_id')
                ->constrained('departments')
                ->restrictOnDelete();
            $table->foreignUlid('province_id')
                ->constrained('provinces')
                ->restrictOnDelete();
            $table->foreignUlid('district_id')
                ->constrained('districts')
                ->restrictOnDelete();

            $table->string('department_name');
            $table->string('province_name');
            $table->string('district_name');
            $table->string('shipping_address_line');
            $table->string('shipping_number')->nullable();
            $table->string('shipping_floor_apartment')->nullable();
            $table->string('shipping_reference')->nullable();

            $table->string('currency', 3)->default('PEN');
            $table->decimal('subtotal', 12, 2);
            $table->decimal('delivery_cost', 12, 2)->default(0);
            $table->decimal('discount_total', 12, 2)->default(0);
            $table->decimal('total', 12, 2);

            $table->foreignUlid('payment_method_id')
                ->nullable()
                ->constrained('payment_methods')
                ->nullOnDelete();

            $table->enum('payment_method_type', ['bank_transfer', 'niubiz']);
            $table->enum('status', [
                'pending',
                'confirmed',
                'preparing',
                'shipped',
                'delivered',
                'cancelled',
            ])->default('pending');
            $table->enum('payment_status', [
                'pending',
                'approved',
                'rejected',
                'failed',
                'refunded',
            ])->default('pending');
            $table->enum('shipping_status', [
                'pending',
                'assigned',
                'in_transit',
                'delivered',
                'failed',
            ])->default('pending');

            $table->timestamp('placed_at')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();

            $table->text('notes')->nullable();
            $table->text('admin_notes')->nullable();

            $table->timestamps();

            $table->index(['customer_id', 'created_at'], 'orders_customer_created_idx');
            $table->index(['status', 'payment_status', 'shipping_status'], 'orders_state_idx');
            $table->index('niubiz_purchase_number', 'orders_niubiz_purchase_number_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
