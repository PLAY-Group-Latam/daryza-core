<?php

namespace Database\Factories\Blogs;

use App\Models\Blogs\Blog;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;


class BlogFactory extends Factory
{
    protected $model = Blog::class;

    public function definition(): array
    {
        $title = 'Blog de prueba ' . Str::random(2);
        return [
            'title' => Str::title($title),
            'slug' => Str::slug($title) . '-' . Str::lower(Str::random(5)),
            'description' => 'Descripción de prueba',
            'content' => '<p>Contenido de prueba</p>',
            'image' => null,
            'visibility' => true,
            'author' => 'Autor de prueba',
            'miniature' => null,
            'publication_date' => now()->toDateString(),
        ];
    }
}
