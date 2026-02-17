<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $table) {
            $table->ulid('id')->primary();
            
            $table->string('type')->index();
            
            $table->string('full_name');
            $table->string('email')->index();
            $table->string('phone');
            
            $table->json('data');
            
            $table->string('file_path')->nullable();
            $table->string('file_original_name')->nullable();
            
            $table->string('status')->default('new')->index();
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['type', 'status']);
            $table->index('created_at');
        });
    }

    
    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};