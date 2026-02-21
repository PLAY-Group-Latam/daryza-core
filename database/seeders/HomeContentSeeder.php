<?php

use Illuminate\Database\Seeder;
use App\Models\Page;

class HomeContentSeeder extends Seeder
{
    public function run(): void
    {
        $home = Page::where('slug', 'home')->first();

        if (!$home) return;

        $defaults = require database_path('seeders/content/home.php');

        foreach ($defaults as $key => $content) {

            $section = $home->sections()->where('key', $key)->first();

            if (!$section) continue;

            if (empty($section->content)) {
                $section->update([
                    'content' => $content
                ]);
            }
        }
    }
}