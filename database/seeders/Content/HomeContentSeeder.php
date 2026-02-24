<?php

namespace Database\Seeders\Content;

use Illuminate\Database\Seeder;
use App\Models\Content\Page;

class HomeContentSeeder extends Seeder
{
    public function run(): void
    {
        $home = Page::where('slug', 'home')->first();

        if (!$home) return;

        $defaults = require database_path('data/content/home/home.php');

        foreach ($defaults as $type => $content) {

            $section = $home->sections()->where('type', $type)->first();

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
