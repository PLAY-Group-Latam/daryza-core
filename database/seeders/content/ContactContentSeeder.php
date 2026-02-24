<?php

namespace Database\Seeders\Content;

use Illuminate\Database\Seeder;
use App\Models\Content\Page;

class ContactContentSeeder  extends Seeder
{
    public function run(): void
    {
        $contactos = Page::where('slug', 'contactos')->first();

        if (!$contactos) return;

        $defaults = require database_path('data/content/contact/contact.php');

        foreach ($defaults as $type => $content) {

            $section = $contactos->sections()->where('type', $type)->first();

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