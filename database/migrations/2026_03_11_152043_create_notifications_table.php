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
        Schema::create('notification_reads', function (Blueprint $table) {

            $table->id();

            $table->ulid('notification_id');

            $table->foreign('notification_id')
                ->references('id')
                ->on('notifications')
                ->cascadeOnDelete();

            $table->foreignUlid('customer_id')
                ->nullable()
                ->constrained('customers')
                ->cascadeOnDelete();

            $table->string('visitor_id')->nullable();

            $table->timestamp('read_at')->nullable();
            
            $table->boolean('is_deleted')->default(false);

            $table->timestamps();

            $table->index('customer_id');
            $table->index('visitor_id');

            $table->unique(['notification_id','customer_id']);
            $table->unique(['notification_id','visitor_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
{
    Schema::dropIfExists('notification_reads');
}
};
