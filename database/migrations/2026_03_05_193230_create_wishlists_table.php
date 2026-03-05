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
    Schema::create('wishlists', function (Blueprint $table) {
        $table->ulid('id')->primary();

        $table->foreignUlid('customer_id')
              ->constrained('customers')
              ->onDelete('cascade');

        $table->ulidMorphs('item'); 

        $table->timestamp('created_at')->useCurrent();
        
        $table->unique(['customer_id', 'item_id', 'item_type']);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wishlists');
    }
};
