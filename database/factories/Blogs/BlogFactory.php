<?php

namespace Database\Factories\Blogs;

use App\Models\Blogs\Blog;
use Illuminate\Database\Eloquent\Factories\Factory;


class BlogFactory extends Factory
{
    protected $model = Blog::class;
    protected static int $sequence = 0;

    public function definition(): array
    {
        $index = ++static::$sequence;
        $title = "Blog de prueba {$index}";

        return [
            'title' => $title,
            'slug' => "blog-de-prueba-{$index}",
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
