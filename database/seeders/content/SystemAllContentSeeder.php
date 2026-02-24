<?php

namespace Database\Seeders\Content;

use Illuminate\Database\Seeder;
use App\Models\Content\Page;

class SystemAllContentSeeder extends Seeder
{
    public function run(): void
    {
        $sistema = Page::where('slug', 'sistema')->first();

        if (!$sistema) return;

        $defaults = require database_path('data/content/system-all/system-all.php');

        foreach ($defaults as $type => $content) {

            $section = $sistema->sections()->where('type', $type)->first();

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