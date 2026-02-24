<?php

namespace Database\Seeders\Content;

use Illuminate\Database\Seeder;
use App\Models\Content\Page;

class AboutUsContentSeeder extends Seeder
{
    
    private array $checkFields = [
        'nosotros_intro'          => 'video',
        'nosotros_proposito'      => 'titulo',
        'nosotros_sostenibilidad' => 'titulo',
        'nosotros_historia'       => 'titulo',
    ];

    public function run(): void
    {
        $nosotros = Page::where('slug', 'nosotros')->first();

        if (!$nosotros) return;

        $defaults = require database_path('data/content/aboutus/aboutus.php');

        foreach ($defaults as $type => $content) {

            $section = $nosotros->sections()->where('type', $type)->first();

            if (!$section) continue;

            $sectionContent = $section->content;

            if (!$sectionContent) continue;

            $current = $sectionContent->content ?? [];

            $checkField = $this->checkFields[$type] ?? null;

            $shouldUpdate = $checkField
                ? empty($current[$checkField])
                : empty($current);

            if ($shouldUpdate) {
                $sectionContent->update([
                    'content' => $content
                ]);
            }
        }
    }
}