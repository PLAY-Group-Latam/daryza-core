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
        Schema::create('distributors', function (Blueprint $table) {
            $table->id();
          
            $table->string('name');
            $table->string('region');
            $table->string('ruc', 11)->nullable();
            $table->string('address')->nullable();
            $table->string('email')->nullable();
            $table->string('phone', 20)->nullable();
            $table->text('note')->nullable();
         
            $table->string('img_info')->nullable();
            
            $table->decimal('lat', 10, 8);
            $table->decimal('lng', 11, 8);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('distributors');
    }
};
