<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('landing_leads', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('landing_id')->constrained('landings')->cascadeOnDelete();

            $table->string('form_key')->index();
            $table->string('campaign_key')->nullable()->index();

            $table->string('full_name');
            $table->string('email')->index();
            $table->string('phone');

            $table->json('data')->nullable();
            $table->json('source_data')->nullable();

            $table->string('page_url')->nullable();
            $table->string('referrer')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['landing_id', 'form_key'], 'landing_leads_landing_form_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('landing_leads');
    }
};
