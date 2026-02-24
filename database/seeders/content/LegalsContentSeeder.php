<?php

namespace Database\Seeders\Content;

use Illuminate\Database\Seeder;
use App\Models\Content\Page;

class LegalsContentSeeder extends Seeder
{
    public function run(): void
    {
        $legales = Page::where('slug', 'legales')->first();

        if (!$legales) return;

        $defaults = require database_path('data/content/legals/legals.php');

        foreach ($defaults as $type => $content) {

            $section = $legales->sections()->where('type', $type)->first();

            if (!$section) continue;

            $sectionContent = $section->content;

            if (!$sectionContent) continue;
            $currentContent = $sectionContent->content ?? [];

            if (empty($currentContent['body'])) {
                $sectionContent->update([
                    'content' => $content
                ]);
            }
        }
    }
}