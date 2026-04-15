<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->enum('discount_type', ['fixed', 'percentage'])->default('fixed');
            $table->decimal('discount_amount', 10, 2)->default(0.00);
            $table->decimal('maximum_discount_amount', 10, 2)->nullable();
            $table->decimal('minimum_order_amount', 10, 2)->default(0.00);
            $table->enum('scope', ['global', 'product', 'category', 'pack', 'business_dynamic', 'customer'])->default('global');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_public')->default(true);
            $table->unsignedInteger('usage_limit')->nullable();
            $table->unsignedInteger('usage_limit_per_user')->nullable();
            $table->dateTime('valid_from')->nullable();
            $table->dateTime('valid_until')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('coupon_products', function (Blueprint $table) {
            $table->ulid('coupon_id');
            $table->foreign('coupon_id')->references('id')->on('coupons')->cascadeOnDelete();
            $table->ulid('product_id');
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
            $table->primary(['coupon_id', 'product_id']);
        });

        Schema::create('coupon_categories', function (Blueprint $table) {
            $table->ulid('coupon_id');
            $table->foreign('coupon_id')->references('id')->on('coupons')->cascadeOnDelete();
            $table->ulid('category_id');
            $table->foreign('category_id')->references('id')->on('product_categories')->cascadeOnDelete();
            $table->primary(['coupon_id', 'category_id']);
        });

        Schema::create('coupon_packs', function (Blueprint $table) {
            $table->ulid('coupon_id');
            $table->foreign('coupon_id')->references('id')->on('coupons')->cascadeOnDelete();
            $table->ulid('pack_id');
            $table->foreign('pack_id')->references('id')->on('product_packs')->cascadeOnDelete();
            $table->primary(['coupon_id', 'pack_id']);
        });

        Schema::create('coupon_business_dynamics', function (Blueprint $table) {
            $table->ulid('coupon_id');
            $table->foreign('coupon_id')->references('id')->on('coupons')->cascadeOnDelete();
            $table->ulid('dynamic_category_id');
            $table->foreign('dynamic_category_id')->references('id')->on('dynamic_categories')->cascadeOnDelete();
            $table->primary(['coupon_id', 'dynamic_category_id']);
        });

        Schema::create('coupon_customers', function (Blueprint $table) {
            $table->ulid('coupon_id');
            $table->foreign('coupon_id')->references('id')->on('coupons')->cascadeOnDelete();
            $table->ulid('customer_id');
            $table->foreign('customer_id')->references('id')->on('customers')->cascadeOnDelete();
            $table->primary(['coupon_id', 'customer_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupon_customers');
        Schema::dropIfExists('coupon_business_dynamics');
        Schema::dropIfExists('coupon_packs');
        Schema::dropIfExists('coupon_categories');
        Schema::dropIfExists('coupon_products');
        Schema::dropIfExists('coupons');
    }
};
