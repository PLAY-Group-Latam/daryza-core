<?php

namespace Database\Seeders\Content;

use Illuminate\Database\Seeder;
use App\Models\Content\Page;

class FooterContentSeeder extends Seeder
{
    public function run(): void
    {
        $footer = Page::where('slug', 'footer')->first();

        if (!$footer) return;

        $defaults = require database_path('data/content/footer/footer.php');

        foreach ($defaults as $type => $content) {

            $section = $footer->sections()->where('type', $type)->first();

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