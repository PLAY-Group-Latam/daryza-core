<?php

namespace Database\Seeders\Content;

use Illuminate\Database\Seeder;
use App\Models\Content\Page;

class BlogContentSeeder extends Seeder
{
    public function run(): void
    {
        $blog = Page::where('slug', 'blog')->first();

        if (!$blog) return;

        $defaults = require database_path('data/content/blogs/blog.php');

        foreach ($defaults as $type => $content) {

            $section = $blog->sections()->where('type', $type)->first();

            if (!$section) continue;

            $sectionContent = $section->content;

            if (!$sectionContent) continue;

            if (empty($sectionContent->content)) {
                $sectionContent->update([
                    'content' => $content
                ]);
            }
        }
    }
}