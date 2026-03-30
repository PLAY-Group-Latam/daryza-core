<?php

namespace Database\Factories\Blogs;

use App\Models\Blogs\BlogCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

class BlogCategoryFactory extends Factory
{
    protected $model = BlogCategory::class;
    protected static int $sequence = 0;

    public function definition(): array
    {
        $index = ++static::$sequence;
        $names = ['Novedades', 'Recetas', 'Nutricion', 'Promociones', 'Consejos'];

        return [
            'name' => $names[($index - 1) % count($names)] . " {$index}",
        ];
    }
}
