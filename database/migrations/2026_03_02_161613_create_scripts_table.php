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
    Schema::create('scripts', function (Blueprint $table) {
        $table->ulid('id')->primary();

        // Nombre identificable del script
        $table->string('name');

        // Ubicación donde se renderiza
        $table->enum('placement', ['head', 'body'])->default('head');

        // Tipo de consentimiento requerido para ejecutar el script
        $table->enum('consent_type', ['necessary', 'analytics', 'marketing'])->default('necessary');

        // Permite activar / desactivar sin borrar
        $table->boolean('active')->default(true);

        // Código completo del script
        $table->longText('content');

        $table->timestamps();

        // Índice compuesto para consultas frecuentes
        $table->index(['active', 'placement']);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scripts');
    }
};
