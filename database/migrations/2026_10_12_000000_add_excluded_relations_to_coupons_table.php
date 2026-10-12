<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupon_excluded_products', function (Blueprint $table) {
            $table->ulid('coupon_id');
            $table->foreign('coupon_id')->references('id')->on('coupons')->cascadeOnDelete();
            $table->ulid('product_id');
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
            $table->primary(['coupon_id', 'product_id']);
        });

        Schema::create('coupon_excluded_packs', function (Blueprint $table) {
            $table->ulid('coupon_id');
            $table->foreign('coupon_id')->references('id')->on('coupons')->cascadeOnDelete();
            $table->ulid('pack_id');
            $table->foreign('pack_id')->references('id')->on('product_packs')->cascadeOnDelete();
            $table->primary(['coupon_id', 'pack_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupon_excluded_packs');
        Schema::dropIfExists('coupon_excluded_products');
    }
};
