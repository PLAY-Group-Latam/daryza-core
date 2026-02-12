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
    Schema::create('page_sections', function (Blueprint $table) {
        $table->id();
        $table->foreignId('page_id')
            ->constrained()
            ->cascadeOnDelete();

        $table->string('name'); 
        $table->string('type'); 

        $table->integer('sort_order')->default(0);
        $table->boolean('is_active')->default(true);

        $table->json('settings')->nullable(); 

        $table->timestamps();

        $table->index(['page_id', 'sort_order']);
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('page_sections');
    }
};
