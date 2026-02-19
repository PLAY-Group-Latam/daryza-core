<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('blogs', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->text('content');
            $table->string('image')->nullable();
            $table->boolean('visibility')->default(false);
            $table->string('author');
            $table->string('miniature')->nullable();
            $table->string('publication_date');
            $table->timestamps();
        });

        Schema::create('blog_categories', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('blog_category_blog', function (Blueprint $table) {
            $table->foreignUlid('blog_id')->constrained('blogs')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignUlid('category_id')->constrained('blog_categories')->cascadeOnDelete()->cascadeOnUpdate();
            $table->primary(['blog_id', 'category_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blog_category_blog');
        Schema::dropIfExists('blog_categories');
        Schema::dropIfExists('blogs');
    }
};
