<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
     Schema::create('destination_emails', function (Blueprint $table) {
    $table->ulid('id')->primary();
    $table->string('name');
    $table->string('email');
    $table->json('page_keys');
    $table->boolean('is_active')->default(true);
    $table->timestamps();

    $table->index('email');
    $table->index('is_active');
});
    }

    public function down(): void
    {
        Schema::dropIfExists('destination_emails');
    }
};
