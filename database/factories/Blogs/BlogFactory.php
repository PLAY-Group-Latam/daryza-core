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
        $title = fake()->sentence(8);

        return [
            'title' => Str::title($title),
            'slug' => Str::slug($title) . '-' . Str::lower(Str::random(5)),
            'description' => fake()->paragraph(),
            'content' => '<p>' . fake()->paragraphs(3, true) . '</p>',
            'image' => null,
            'visibility' => true,
            'author' => fake()->name(),
            'miniature' => null,
            'publication_date' => now()->subDays(fake()->numberBetween(1, 30))->toDateString(),
        ];
    }
}
