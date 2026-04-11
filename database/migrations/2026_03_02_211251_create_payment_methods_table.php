<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\Currency\CurrencyType;
return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up(): void
    {
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('company_type');              
            $table->string('name');                       
            $table->string('account_number')->nullable(); 
            $table->string('currency')->default(CurrencyType::SOLES->value);
            $table->string('extra_info')->nullable();     
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_methods');
    }
};
